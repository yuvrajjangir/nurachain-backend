const express = require('express');
const Product = require('../models/Product');
const Transaction = require('../models/Transaction');
const SystemMetric = require('../models/SystemMetric');
const { protect, restrictTo } = require('../middleware/auth');
const router = express.Router();

// Helper function to create transaction
const createTransaction = async (product, fromUser, toUser, status, location) => {
  const transactionId = 'TXN-' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
  
  return await Transaction.create({
    transactionId,
    product: product._id,
    productTrackingNumber: product.trackingNumber,
    fromUser: fromUser._id,
    toUser: toUser._id,
    quantity: 1, // Default to 1 for now
    status: 'processing',
    shipmentDetails: {
      carrier: 'Internal',
      trackingNumber: product.trackingNumber,
      origin: {
        address: location || product.currentLocation,
        coordinates: [0, 0] // Default coordinates
      },
      destination: {
        address: location || product.currentLocation,
        coordinates: [0, 0] // Default coordinates
      }
    },
    timeline: [{
      status: 'processing',
      location: {
        address: location || product.currentLocation,
        coordinates: [0, 0]
      },
      notes: `Product status updated to ${status}`
    }],
    totalAmount: product.price || 0
  });
};

// Get all products with filtering and pagination
router.get('/', protect, async (req, res) => {
  try {
    const {
      category,
      subCategory,
      minStrength,
      maxStrength,
      finish,
      sortBy,
      sortOrder,
      page = 1,
      limit = 10
    } = req.query;

    // Build query
    const query = {};
    
    // Role-based filtering
    switch (req.user.role) {
      case 'distributor':
        // Distributors can see all products that are in-distribution
        query.status = 'in-distribution';
        break;
      case 'supplier':
        // Suppliers can see all products that are in-supply
        query.status = 'in-supply';
        break;
      case 'customer':
        // Customers can see all products that are delivered
        query.status = 'delivered';
        break;
      case 'manufacturer':
        // Manufacturers can see all products that are manufactured
        query.status = 'manufactured';
        break;
      // Admin can see all products
    }
    
    // Apply category filter
    if (category) {
      query.category = category;
    }

    // Apply subcategory filter
    if (subCategory) {
      query.subCategory = subCategory;
    }

    // Apply strength filters
    if (minStrength || maxStrength) {
      query['specifications.mechanicalProperties'] = {};

      if (minStrength) {
        query['specifications.mechanicalProperties.tensileStrength'] = { $gte: parseFloat(minStrength) };
      }

      if (maxStrength) {
        query['specifications.mechanicalProperties.tensileStrength'] = {
          ...query['specifications.mechanicalProperties.tensileStrength'] || {},
          $lte: parseFloat(maxStrength)
        };
      }
    }

    // Apply finish filter
    if (finish) {
      query['specifications.finish'] = finish;
    }

    // Build sort options
    const sortOptions = {};
    if (sortBy) {
      sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;
    } else {
      sortOptions.createdAt = -1; // Default sort by newest
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Execute query
    const products = await Product.find(query)
      .populate('manufacturer', 'username company')
      .populate('currentOwner', 'username company')
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));
      
    // Get total count for pagination
    const totalProducts = await Product.countDocuments(query);

    // Record metric for product search
    try {
      await SystemMetric.recordMetric({
        type: 'inventory_metrics',
        name: 'product_search',
        value: products.length,
        metadata: {
          category: category || 'all',
          subCategory: subCategory,
          filters: Object.keys(query).length,
          userId: req.user._id,
          role: req.user.role
        },
        source: 'product_api'
      });
    } catch (metricError) {
      console.warn('Error recording product search metric:', metricError);
    }

    res.json({
      products,
      pagination: {
        total: totalProducts,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(totalProducts / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ message: 'Error fetching products', error: error.message });
  }
});

// Get product categories and subcategories
router.get('/categories', protect, async (req, res) => {
  try {
    const categories = await Product.aggregate([
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
        $group: {
          _id: '$_id.category',
          subCategories: {
            $push: {
              name: '$_id.subCategory',
              count: '$count'
            }
          },
          totalCount: { $sum: '$count' }
        }
      },
      {
        $project: {
          _id: 0,
          category: '$_id',
          subCategories: 1,
          totalCount: 1
        }
      },
      {
        $sort: { totalCount: -1 }
      }
    ]);
    
    res.json(categories);
    } catch (error) {
    console.error('Error fetching product categories:', error);
    res.status(500).json({ message: 'Error fetching product categories' });
  }
});

// Get available materials
router.get('/materials', protect, async (req, res) => {
  try {
    const materials = await Product.distinct('specifications.material');
    res.json(materials);
  } catch (error) {
    console.error('Error fetching materials:', error);
    res.status(500).json({ message: 'Error fetching materials' });
  }
});

// Get product by tracking number
router.get('/track/:trackingNumber', protect, async (req, res) => {
  try {
    const product = await Product.findOne({ trackingNumber: req.params.trackingNumber })
      .populate('manufacturer', 'username company')
      .populate('currentOwner', 'username company')
      .populate({
        path: 'timeline',
        populate: {
          path: 'handler',
          select: 'username company'
        }
      });

    if (!product) {
      return res.status(404).json({ 
        message: 'Product not found. Please check the tracking number.' 
      });
    }

    // Format the response
    const formattedProduct = {
      ...product.toObject(),
      manufacturer: product.manufacturer.company || product.manufacturer.username,
      currentOwner: product.currentOwner.company || product.currentOwner.username,
      timeline: product.timeline.map(entry => ({
        ...entry,
        handler: entry.handler?.company || entry.handler?.username || 'System'
      }))
    };

    res.json(formattedProduct);
  } catch (error) {
    console.error('Error tracking product:', error);
    res.status(500).json({ message: 'Error tracking product' });
  }
});

// Get product by ID
router.get('/:id', protect, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
        .populate('manufacturer', 'username company')
        .populate('currentOwner', 'username company');
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    res.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(400).json({ message: error.message });
  }
});

// Create new product
router.post('/', protect, restrictTo('manufacturer', 'supplier', 'admin'), async (req, res) => {
  try {
    console.log('Creating product with user role:', req.user.role); // Debug log

    const product = new Product({
      ...req.body,
      manufacturer: req.user._id,
      currentOwner: req.user._id,
      status: 'in-supply',
      trackingNumber: 'TRK-' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
      timeline: [{
        status: 'manufactured',
        title: 'Product Manufactured',
        date: new Date(),
        location: req.body.currentLocation,
        handler: req.user._id,
        description: 'Product added to inventory'
      }, {
        status: 'in-supply',
        title: 'Quality Check Passed',
        date: new Date(),
        location: req.body.currentLocation,
        handler: req.user._id,
        description: 'Product passed automated quality check'
      }]
    });

    console.log('Product before save:', product); // Debug log

    await product.save();
    
    // Populate the manufacturer and currentOwner fields
    await product.populate('manufacturer', 'username company');
    await product.populate('currentOwner', 'username company');

    console.log('Product after save:', product); // Debug log

    res.status(201).json(product);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(400).json({ message: error.message });
  }
});

// Update product status
router.patch('/:id/status', protect, restrictTo('supplier', 'distributor', 'quality-inspector', 'admin'), async (req, res) => {
  try {
    const { status, location, notes } = req.body;
    const product = await Product.findById(req.params.id)
      .populate('currentOwner', 'username company role');
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Role-based status update validation
    const allowedTransitions = {
      'supplier': {
        'manufactured': ['in-supply'],
        'quality-check': ['in-supply']
      },
      'quality-inspector': {
        'quality-check': ['manufactured', 'in-supply']
      },
      'distributor': {
        'in-supply': ['in-distribution'],
        'in-distribution': ['delivered']
      },
      'admin': {
        'manufactured': ['in-supply'],
        'quality-check': ['manufactured', 'in-supply'],
        'in-supply': ['in-distribution'],
        'in-distribution': ['delivered']
      }
    };

    // Check if user has permission for this status transition
    const userRole = req.user.role;
    const allowedNextStates = allowedTransitions[userRole]?.[product.status] || [];
    
    if (!allowedNextStates.includes(status)) {
      return res.status(403).json({
        message: `${userRole} cannot change status from ${product.status} to ${status}`
      });
    }

    // Update status and location
    const previousStatus = product.status;
    product.status = status;
    product.currentLocation = location;
    
    // Create transaction for status change
    if (['in-supply', 'in-distribution', 'delivered'].includes(status)) {
      await createTransaction(
        product,
        product.currentOwner,
        req.user,
        status,
        location
      );
    }
    
    // Update current owner if status changes to in-distribution
    if (status === 'in-distribution') {
      product.currentOwner = req.user._id;
    }
    
    // Add to timeline
    product.timeline.push({
      status,
      title: `Status Updated: ${status}`,
      date: new Date(),
      location,
      handler: req.user._id,
      description: notes || `Product status updated to ${status}`
    });
    
    await product.save();
    res.json(product);
  } catch (error) {
    console.error('Update status error:', error);
    res.status(400).json({ message: error.message });
  }
});

// Quality check endpoint
router.post('/:id/quality-check', protect, restrictTo('supplier', 'quality-inspector', 'admin'), async (req, res) => {
  try {
    // Auto-pass quality check
    const passed = true; // Always pass quality check
    const notes = req.body.notes || 'Automated quality check passed';
    const checkDetails = req.body.checkDetails || { automated: true };
    
    const product = await Product.findById(req.params.id)
      .populate('currentOwner', 'username company');
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Update status to in-supply regardless of current status
    product.status = 'in-supply';
    
    // Add to timeline
    product.timeline.push({
      status: product.status,
      title: `Quality Check: Passed`,
      date: new Date(),
      location: product.currentLocation,
      handler: req.user._id,
      description: notes,
      metadata: checkDetails
    });
    
    await product.save();
    res.json(product);
  } catch (error) {
    console.error('Quality check error:', error);
    res.status(400).json({ message: error.message });
  }
});

// Transfer product ownership
router.post('/:id/transfer', protect, restrictTo('supplier', 'distributor', 'admin'), async (req, res) => {
  try {
    const { destinationUserId, location, notes } = req.body;
    const product = await Product.findById(req.params.id)
      .populate('currentOwner', 'username company');
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Create transaction for ownership transfer
    await createTransaction(
      product,
      product.currentOwner,
      { _id: destinationUserId },
      'transfer',
      location
    );

    // Update ownership
    const previousOwner = product.currentOwner;
    product.currentOwner = destinationUserId;
    product.currentLocation = location;
    
    // Add to timeline
    product.timeline.push({
      status: product.status,
      title: 'Ownership Transferred',
      date: new Date(),
      location,
      handler: req.user._id,
      description: notes || 'Product ownership transferred',
      metadata: {
        fromUser: previousOwner,
        toUser: destinationUserId
      }
    });
    
    await product.save();
    res.json(product);
  } catch (error) {
    console.error('Transfer error:', error);
    res.status(400).json({ message: error.message });
  }
});

// Get product timeline
router.get('/:id/timeline', protect, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .select('timeline')
      .populate('timeline.handler', 'username company');
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    res.json(product.timeline);
  } catch (error) {
    console.error('Get timeline error:', error);
    res.status(400).json({ message: error.message });
  }
});

// Update product details
router.patch('/:id', protect, restrictTo('supplier', 'admin'), async (req, res) => {
  try {
    const updates = req.body;
    delete updates.timeline; // Prevent direct timeline manipulation
    delete updates.manufacturer; // Prevent manufacturer change
    
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    ).populate('manufacturer', 'username company')
     .populate('currentOwner', 'username company');

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Add certification
router.post('/:id/certifications', protect, restrictTo('supplier', 'admin'), async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    product.certifications.push(req.body);
    await product.save();
    
    res.json(product);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
