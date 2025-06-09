const express = require('express');
const router = express.Router();
const SystemMetric = require('../models/SystemMetric');
const Product = require('../models/Product');
const Transaction = require('../models/Transaction');
const User = require('../models/User');
const { protect, restrictTo } = require('../middleware/auth');

// Root route - redirect to dashboard metrics
router.get('/', protect, async (req, res) => {
  try {
    const userId = req.user._id;
    const role = req.user.role;
    
    // Get dashboard metrics based on user role
    const dashboardMetrics = await SystemMetric.getDashboardMetrics(userId, role);
    
    // Get key metrics counts
    const [pendingShipments, deliveredProducts, delayedShipments] = await Promise.all([
      Transaction.countDocuments({ 
      status: { $in: ['pending', 'processing', 'in-transit'] } 
      }),
      Transaction.countDocuments({ 
      status: 'delivered',
      'shipmentDetails.actualDelivery': { $exists: true }
      }),
      Transaction.countDocuments({
      status: { $in: ['in-transit', 'processing'] },
      'shipmentDetails.delays': { $exists: true, $not: { $size: 0 } }
      })
    ]);
    
    // Get recent transactions
    const recentTransactions = await Transaction.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('fromUser', 'username company.name')
      .populate('toUser', 'username company.name')
      .populate('product', 'name trackingNumber category');
    
    // Get product distribution by category
    const productsByCategory = await Product.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);
    
    res.json({
      dashboardMetrics,
      keyMetrics: {
        pendingShipments,
        deliveredProducts,
        delayedShipments
      },
      recentTransactions,
      productsByCategory
    });
  } catch (error) {
    console.error('Error getting metrics:', error);
    res.status(500).json({ 
      message: 'Error getting metrics',
      error: error.message 
    });
  }
});

// Get role-specific dashboard metrics
router.get('/dashboard', protect, async (req, res) => {
  try {
    const userRole = req.user.role;
    let statusFilter;
    let transactionStatusFilter;

    // Set status filter based on user role
    switch (userRole) {
      case 'manufacturer':
        statusFilter = 'manufactured';
        transactionStatusFilter = ['manufacturing', 'in-production'];
        break;
      case 'supplier':
        statusFilter = 'in-supply';
        transactionStatusFilter = ['supply-chain', 'in-supply', 'supply-transfer'];
        break;
      case 'distributor':
        statusFilter = 'in-distribution';
        transactionStatusFilter = ['distribution', 'in-distribution', 'distribution-transfer'];
        break;
      case 'customer':
        statusFilter = 'delivered';
        transactionStatusFilter = ['delivery', 'delivered', 'customer-received'];
        break;
      default:
        statusFilter = null; // Admin sees all
        transactionStatusFilter = null;
    }

    // Build base query
    const query = statusFilter ? { status: statusFilter } : {};
    const transactionQuery = transactionStatusFilter ? { status: { $in: transactionStatusFilter } } : {};

    // Get total products for the role
    const totalProducts = await Product.countDocuments(query);

    // Get product status distribution
    const productStatus = await Product.aggregate([
      { $match: query },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    // Get recent transactions based on role
    const recentTransactions = await Transaction.find(transactionQuery)
      .populate('product', 'name trackingNumber')
      .populate('fromUser', 'username')
      .populate('toUser', 'username')
      .sort({ createdAt: -1 })
      .limit(10);

    // Calculate metrics based on role
    let metrics = {
      totalProducts,
      productStatus,
      recentTransactions,
      delayedShipments: 0,
      failedProducts: 0,
      efficiency: 0,
      qualityScore: 0,
      supplyChainHealth: 0
    };

    // Add role-specific metrics
    switch (userRole) {
      case 'manufacturer':
        metrics.failedProducts = await Product.countDocuments({ status: 'failed' });
        metrics.qualityScore = 95;
        metrics.efficiency = 88;
        break;
      case 'supplier':
        metrics.delayedShipments = await Transaction.countDocuments({ 
          ...transactionQuery,
          'shipmentDetails.delays': { $exists: true, $ne: [] }
        });
        metrics.supplyChainHealth = 92;
        metrics.qualityScore = 90;
        break;
      case 'distributor':
        metrics.delayedShipments = await Transaction.countDocuments({ 
          ...transactionQuery,
          'shipmentDetails.delays': { $exists: true, $ne: [] }
        });
        metrics.efficiency = 85;
        metrics.qualityScore = 88;
        break;
      case 'customer':
        metrics.delayedShipments = await Transaction.countDocuments({ 
          ...transactionQuery,
          'shipmentDetails.delays': { $exists: true, $ne: [] }
        });
        metrics.qualityScore = 92;
        metrics.efficiency = 90;
        break;
    }

    // Get monthly activity with proper aggregation
    const monthlyActivity = await Transaction.aggregate([
      { 
        $match: {
          ...transactionQuery,
          createdAt: { 
            $gte: new Date(new Date().setMonth(new Date().getMonth() - 11)) 
          }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          shipments: { $sum: 1 },
          transactions: { $sum: 1 },
          products: { $sum: { $ifNull: ['$quantity', 1] } }
        }
      },
      {
        $project: {
          _id: 0,
          month: {
            $concat: [
              { $toString: '$_id.year' },
              '-',
              {
                $cond: {
                  if: { $lt: ['$_id.month', 10] },
                  then: { $concat: ['0', { $toString: '$_id.month' }] },
                  else: { $toString: '$_id.month' }
                }
              }
            ]
          },
          shipments: 1,
          transactions: 1,
          products: 1
        }
      },
      { $sort: { month: 1 } }
    ]);

    // Ensure we have data for all months in the last year
    const last12Months = Array.from({ length: 12 }, (_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      return {
        month: `${year}-${month}`,
        shipments: 0,
        transactions: 0,
        products: 0
      };
    }).reverse();

    // Merge actual data with empty months
    const completeMonthlyActivity = last12Months.map(month => {
      const existingData = monthlyActivity.find(d => d.month === month.month);
      return existingData || month;
    });

    metrics.monthlyActivity = completeMonthlyActivity;

    res.json(metrics);
  } catch (error) {
    console.error('Error fetching dashboard metrics:', error);
    res.status(500).json({ message: 'Error fetching dashboard metrics', error: error.message });
  }
});

// Get supply chain metrics
router.get('/supply-chain', protect, async (req, res) => {
  try {
    const { startDate, endDate, category } = req.query;
    
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();
    
    // Get supply chain efficiency metrics
    const supplyChainMetrics = await SystemMetric.find({
      type: 'supply_chain_efficiency',
      timestamp: { $gte: start, $lte: end },
      ...(category && { 'metadata.category': category })
    }).sort({ timestamp: -1 });
    
    // Get average delivery times
    const deliveryTimes = await Transaction.aggregate([
      {
        $match: {
          status: 'delivered',
          'shipmentDetails.actualDelivery': { $exists: true },
          createdAt: { $gte: start, $lte: end }
        }
      },
      {
        $project: {
          deliveryTime: { 
            $subtract: ['$shipmentDetails.actualDelivery', '$createdAt'] 
          },
          category: 1
        }
      },
      {
        $group: {
          _id: null,
          averageDeliveryTime: { $avg: '$deliveryTime' },
          minDeliveryTime: { $min: '$deliveryTime' },
          maxDeliveryTime: { $max: '$deliveryTime' }
        }
      }
    ]);
    
    // Get delay statistics
    const delayStats = await Transaction.aggregate([
      {
        $match: {
          'shipmentDetails.delays': { $exists: true, $not: { $size: 0 } },
          createdAt: { $gte: start, $lte: end }
        }
      },
      {
        $unwind: '$shipmentDetails.delays'
      },
      {
        $group: {
          _id: '$shipmentDetails.delays.reason',
          count: { $sum: 1 },
          averageResolutionTime: {
            $avg: {
              $cond: [
                { $ifNull: ['$shipmentDetails.delays.resolvedAt', false] },
                { $subtract: ['$shipmentDetails.delays.resolvedAt', '$shipmentDetails.delays.reportedAt'] },
                null
              ]
            }
          }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);
    
    res.json({
      supplyChainMetrics,
      deliveryTimes: deliveryTimes[0] || {
        averageDeliveryTime: 0,
        minDeliveryTime: 0,
        maxDeliveryTime: 0
      },
      delayStats
    });
  } catch (error) {
    console.error('Error getting supply chain metrics:', error);
    res.status(500).json({ message: 'Error getting supply chain metrics' });
  }
});

// Get product analytics
router.get('/products', protect, async (req, res) => {
  try {
    const { startDate, endDate, category, subCategory } = req.query;
    
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();
    
    // Build match criteria
    const matchCriteria = {
      createdAt: { $gte: start, $lte: end }
    };
    
    if (category) {
      matchCriteria.category = category;
    }
    
    if (subCategory) {
      matchCriteria.subCategory = subCategory;
    }
    
    // Get product distribution by category and subcategory
    const productDistribution = await Product.aggregate([
      {
        $match: matchCriteria
      },
      {
        $group: {
          _id: {
            category: '$category',
            subCategory: '$subCategory'
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);
    
    // Get product timeline statistics
    const productTimelines = await Product.aggregate([
      {
        $match: matchCriteria
      },
      {
        $unwind: '$timeline'
      },
      {
        $group: {
          _id: '$timeline.status',
          count: { $sum: 1 },
          averageDuration: {
            $avg: {
              $subtract: ['$timeline.date', '$createdAt']
            }
          }
        }
      },
      {
        $sort: { '_id': 1 }
      }
    ]);
    
    // Get mechanical product metrics
    const mechanicalMetrics = await SystemMetric.find({
      type: 'mechanical_product_metrics',
      timestamp: { $gte: start, $lte: end },
      ...(category && { 'metadata.category': category })
    }).sort({ timestamp: -1 });
    
    res.json({
      productDistribution,
      productTimelines,
      mechanicalMetrics
    });
  } catch (error) {
    console.error('Error getting product analytics:', error);
    res.status(500).json({ message: 'Error getting product analytics' });
  }
});

// Get transaction analytics
router.get('/transactions', protect, async (req, res) => {
  try {
    const { startDate, endDate, status } = req.query;
    
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();
    
    // Build match criteria
    const matchCriteria = {
      createdAt: { $gte: start, $lte: end }
    };
    
    if (status) {
      matchCriteria.status = status;
    }
    
    // Get transaction volume over time
    const transactionVolume = await Transaction.aggregate([
      {
        $match: matchCriteria
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          },
          count: { $sum: 1 },
          totalAmount: { $sum: '$totalAmount' }
        }
      },
      {
        $sort: {
          '_id.year': 1,
          '_id.month': 1,
          '_id.day': 1
        }
      }
    ]);
    
    // Get transaction status distribution
    const statusDistribution = await Transaction.aggregate([
      {
        $match: {
          createdAt: { $gte: start, $lte: end }
        }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);
    
    // Get payment status distribution
    const paymentDistribution = await Transaction.aggregate([
      {
        $match: {
          createdAt: { $gte: start, $lte: end }
        }
      },
      {
        $group: {
          _id: '$paymentStatus',
          count: { $sum: 1 },
          totalAmount: { $sum: '$totalAmount' }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);
    
    res.json({
      transactionVolume,
      statusDistribution,
      paymentDistribution
    });
  } catch (error) {
    console.error('Error getting transaction analytics:', error);
    res.status(500).json({ message: 'Error getting transaction analytics' });
  }
});

// Get user analytics (admin only)
router.get('/users', protect, restrictTo('admin'), async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();
    
    // Get user registration over time
    const userRegistration = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: start, $lte: end }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: {
          '_id.year': 1,
          '_id.month': 1,
          '_id.day': 1
        }
      }
    ]);
    
    // Get user distribution by role
    const roleDistribution = await User.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);
    
    // Get verification status distribution
    const verificationDistribution = await User.aggregate([
      {
        $group: {
          _id: '$verificationStatus',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);
    
    // Get user activity metrics
    const userActivity = await SystemMetric.find({
      type: 'user_activity',
      timestamp: { $gte: start, $lte: end }
    }).sort({ timestamp: -1 });
    
    res.json({
      userRegistration,
      roleDistribution,
      verificationDistribution,
      userActivity
    });
  } catch (error) {
    console.error('Error getting user analytics:', error);
    res.status(500).json({ message: 'Error getting user analytics' });
  }
});

// Record a new metric
router.post('/', protect, async (req, res) => {
  try {
    const { type, name, value, metadata, source } = req.body;
    
    const newMetric = await SystemMetric.recordMetric({
      type,
      name,
      value,
      metadata,
      source,
      timestamp: new Date()
    });
    
    res.status(201).json(newMetric);
  } catch (error) {
    console.error('Error recording metric:', error);
    res.status(500).json({ message: 'Error recording metric' });
  }
});

// Get metrics by type and time range
router.get('/:type', protect, async (req, res) => {
  try {
    const { type } = req.params;
    const { startDate, endDate, category, tags, limit, skip, sort, isAnomaly } = req.query;
    
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();
    
    const options = {
      category,
      tags: tags ? tags.split(',') : undefined,
      limit: limit ? parseInt(limit) : 100,
      skip: skip ? parseInt(skip) : 0,
      sort: sort === 'asc' ? 1 : -1,
      isAnomaly: isAnomaly === 'true' ? true : undefined
    };
    
    const metrics = await SystemMetric.getMetrics(type, start, end, options);
    
    res.json(metrics);
  } catch (error) {
    console.error(`Error getting ${req.params.type} metrics:`, error);
    res.status(500).json({ message: `Error getting ${req.params.type} metrics` });
  }
});

// Get aggregated metrics
router.get('/:type/aggregated', protect, async (req, res) => {
  try {
    const { type } = req.params;
    const { startDate, endDate, period, aggregationType } = req.query;
    
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();
    
    const metrics = await SystemMetric.getAggregatedMetrics(
      type,
      period || 'daily',
      start,
      end,
      aggregationType || 'avg'
    );
    
    res.json(metrics);
  } catch (error) {
    console.error(`Error getting aggregated ${req.params.type} metrics:`, error);
    res.status(500).json({ message: `Error getting aggregated ${req.params.type} metrics` });
  }
});

module.exports = router;
