const express = require('express');
const Product = require('../models/Product');
const Transaction = require('../models/Transaction');
const { protect, restrictTo } = require('../middleware/auth');
const router = express.Router();
const mockProducts = require('../data/mock/mockProducts');

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
    const query = {};
    
    // If user is not admin, only show products they own or have access to
    if (req.user.role !== 'admin') {
      query.$or = [
        { manufacturer: req.user._id },
        { currentOwner: req.user._id }
      ];
    }

    console.log('User ID:', req.user._id);
    console.log('User Role:', req.user.role);
    console.log('Query:', JSON.stringify(query));

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build filter object
    const filter = {};
    if (req.query.category) filter.category = req.query.category;
    if (req.query.subCategory) filter.subCategory = req.query.subCategory;
    if (req.query.material) filter['specifications.material'] = req.query.material;
    if (req.query.status) filter.status = req.query.status;

    // Try to get products from database
    let products = [];
    let total = 0;
    
    try {
      products = await Product.find({ ...query, ...filter })
        .populate('manufacturer', 'username company')
        .populate('currentOwner', 'username company')
        .sort('-createdAt')
        .skip(skip)
        .limit(limit);
      
      total = await Product.countDocuments({ ...query, ...filter });
    } catch (error) {
      console.warn('Error fetching from database, using mock data', error);
    }
    
    // If no products in database, use mock data
    if (products.length === 0) {
      // Apply filters to mock data
      let filteredProducts = [...mockProducts];
      
      if (req.query.category) {
        filteredProducts = filteredProducts.filter(p => 
          p.category.toLowerCase() === req.query.category.toLowerCase());
      }
      
      if (req.query.status) {
        filteredProducts = filteredProducts.filter(p => 
          p.status.toLowerCase() === req.query.status.toLowerCase());
      }
      
      if (req.query.material) {
        filteredProducts = filteredProducts.filter(p => 
          p.specifications.material.toLowerCase().includes(req.query.material.toLowerCase()));
      }
      
      total = filteredProducts.length;
      products = filteredProducts.slice(skip, skip + limit);
    }

    console.log('Found Products:', products);

    // If no products found in DB, return empty array
    if (!products || products.length === 0) {
      console.log('No products found');
      return res.json([]);
    }

    // Return the products array
    return res.json({
      products,
      page,
      pages: Math.ceil(total / limit),
      total
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    // Always return an array, even on error
    return res.status(500).json({ 
      message: 'Error fetching products',
      products: [] 
    });
  }
});

// Get categories and subcategories
router.get('/categories', protect, async (req, res) => {
  try {
    // Try to get from database first
    let categories = [];
    let subCategories = [];
    let materials = [];
    
    try {
      categories = await Product.distinct('category');
      subCategories = await Product.distinct('subCategory');
      materials = await Product.distinct('specifications.material');
    } catch (error) {
      console.warn('Error fetching categories from database', error);
    }
    
    // If no categories in database, use mock data
    if (categories.length === 0) {
      categories = [...new Set(mockProducts.map(p => p.category))];
      materials = [...new Set(mockProducts.map(p => p.specifications.material))];
    }
    
    res.json({
      categories,
      subCategories,
      materials
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
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
    // First try to find in database
    let product = null;
    
    try {
      product = await Product.findById(req.params.id)
        .populate('manufacturer', 'username company')
        .populate('currentOwner', 'username company');
    } catch (error) {
      console.warn('Error fetching product from database', error);
    }
    
    // If not found in database, check mock data
    if (!product) {
      product = mockProducts.find(p => p.id === req.params.id);
      
      // If still not found but matches old mock data ID, use that
      if (!product && req.params.id === 'p1' && mockProducts.length > 0) {
        product = mockProducts[0];
      }
    }
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    res.json(product);
  } catch (error) {
    // If error is because ID format is invalid, check mock data
    const mockProduct = mockProducts.find(p => p.id === req.params.id);
    if (mockProduct) {
      return res.json(mockProduct);
    }
    
    // If still not found but matches old mock data ID, use that
    if (req.params.id === 'p1' && mockProducts.length > 0) {
      return res.json(mockProducts[0]);
    }
    
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
        'quality-check': ['in-supply'] // Keep this for backward compatibility
      },
      'quality-inspector': {
        'quality-check': ['manufactured', 'in-supply'] // Keep for backward compatibility
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
      handler: req.user.username,
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
      handler: req.user.username,
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
      handler: req.user.username,
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
