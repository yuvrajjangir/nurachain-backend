const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const SystemMetric = require('../models/SystemMetric');
const { protect, restrictTo } = require('../middleware/auth');

// Get all mechanical products with filtering options
router.get('/', protect, async (req, res) => {
  try {
    const { 
      category, 
      subCategory, 
      material, 
      standard, 
      minSize, 
      maxSize, 
      minStrength, 
      maxStrength,
      finish,
      sortBy,
      sortOrder,
      page = 1,
      limit = 20
    } = req.query;

    // Build query
    const query = {};
    
    // Apply category filter
    if (category) {
      query.category = category;
    }
    
    // Apply subcategory filter
    if (subCategory) {
      query.subCategory = subCategory;
    }
    
    // Apply material filter
    if (material) {
      query['specifications.material'] = material;
    }
    
    // Apply standard filter
    if (standard) {
      query['specifications.standards'] = { $in: [standard] };
    }
    
    // Apply size filters
    if (minSize || maxSize) {
      query['specifications.dimensions'] = {};
      
      if (minSize) {
        // For simplicity, we're checking any dimension against minSize
        query['$or'] = [
          { 'specifications.dimensions.length': { $gte: parseFloat(minSize) } },
          { 'specifications.dimensions.width': { $gte: parseFloat(minSize) } },
          { 'specifications.dimensions.height': { $gte: parseFloat(minSize) } },
          { 'specifications.dimensions.diameter': { $gte: parseFloat(minSize) } }
        ];
      }
      
      if (maxSize) {
        // For simplicity, we're checking any dimension against maxSize
        query['$and'] = [
          { 'specifications.dimensions.length': { $lte: parseFloat(maxSize) } },
          { 'specifications.dimensions.width': { $lte: parseFloat(maxSize) } },
          { 'specifications.dimensions.height': { $lte: parseFloat(maxSize) } },
          { 'specifications.dimensions.diameter': { $lte: parseFloat(maxSize) } }
        ];
      }
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
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit))
      .lean();
    
    // Get total count for pagination
    const totalProducts = await Product.countDocuments(query);
    
    // Record metric for product search
    await SystemMetric.recordMetric({
      type: 'mechanical_product_metrics',
      name: 'product_search',
      value: products.length,
      metadata: {
        category: category || 'all',
        subCategory: subCategory,
        filters: Object.keys(query).length,
        userId: req.user._id
      },
      source: 'product_api'
    });
    
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
    console.error('Error fetching mechanical products:', error);
    res.status(500).json({ message: 'Error fetching mechanical products' });
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

// Get available standards
router.get('/standards', protect, async (req, res) => {
  try {
    const standards = await Product.aggregate([
      { $unwind: '$specifications.standards' },
      { $group: { _id: '$specifications.standards', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $project: { _id: 0, standard: '$_id', count: 1 } }
    ]);
    
    res.json(standards);
  } catch (error) {
    console.error('Error fetching standards:', error);
    res.status(500).json({ message: 'Error fetching standards' });
  }
});

// Get available finishes
router.get('/finishes', protect, async (req, res) => {
  try {
    const finishes = await Product.distinct('specifications.finish');
    res.json(finishes);
  } catch (error) {
    console.error('Error fetching finishes:', error);
    res.status(500).json({ message: 'Error fetching finishes' });
  }
});

// Get mechanical product by ID
router.get('/:id', protect, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('transactions.transaction')
      .lean();
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    // Record view metric
    await SystemMetric.recordMetric({
      type: 'mechanical_product_metrics',
      name: 'product_view',
      value: 1,
      metadata: {
        productId: product._id,
        category: product.category,
        subCategory: product.subCategory,
        userId: req.user._id
      },
      source: 'product_api'
    });
    
    res.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ message: 'Error fetching product' });
  }
});

// Add a new mechanical product (restricted to admin, manufacturer, supplier)
router.post('/', protect, restrictTo('admin', 'manufacturer', 'supplier'), async (req, res) => {
  try {
    const {
      name,
      description,
      category,
      subCategory,
      price,
      quantity,
      specifications,
      trackingNumber
    } = req.body;
    
    // Validate required fields
    if (!name || !category || !specifications || !specifications.material) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    
    // Create a new product
    const newProduct = await Product.create({
      name,
      description,
      category,
      subCategory,
      price,
      quantity,
      specifications,
      trackingNumber: trackingNumber || `MECH-${Date.now().toString(36).toUpperCase()}`,
      createdBy: req.user._id,
      timeline: [{
        status: 'created',
        date: new Date(),
        description: 'Product added to the system',
        updatedBy: req.user._id
      }]
    });
    
    // Record metric for product creation
    await SystemMetric.recordMetric({
      type: 'mechanical_product_metrics',
      name: 'product_created',
      value: 1,
      metadata: {
        productId: newProduct._id,
        category,
        subCategory,
        userId: req.user._id,
        userRole: req.user.role
      },
      source: 'product_api'
    });
    
    res.status(201).json(newProduct);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ message: 'Error creating product' });
  }
});

// Update a mechanical product
router.put('/:id', protect, restrictTo('admin', 'manufacturer', 'supplier'), async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      quantity,
      specifications,
      status
    } = req.body;
    
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    // Check if user has permission to update this product
    if (req.user.role !== 'admin' && product.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this product' });
    }
    
    // Update fields
    if (name) product.name = name;
    if (description) product.description = description;
    if (price) product.price = price;
    if (quantity) product.quantity = quantity;
    if (specifications) product.specifications = specifications;
    
    // Add timeline entry if status changed
    if (status && status !== product.status) {
      product.status = status;
      product.timeline.push({
        status,
        date: new Date(),
        description: `Product status updated to ${status}`,
        updatedBy: req.user._id
      });
    }
    
    // Save the updated product
    const updatedProduct = await product.save();
    
    // Record metric for product update
    await SystemMetric.recordMetric({
      type: 'mechanical_product_metrics',
      name: 'product_updated',
      value: 1,
      metadata: {
        productId: updatedProduct._id,
        category: updatedProduct.category,
        subCategory: updatedProduct.subCategory,
        userId: req.user._id,
        userRole: req.user.role,
        updatedFields: Object.keys(req.body)
      },
      source: 'product_api'
    });
    
    res.json(updatedProduct);
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ message: 'Error updating product' });
  }
});

// Delete a mechanical product (admin only)
router.delete('/:id', protect, restrictTo('admin'), async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    // Store product info for metrics before deletion
    const productInfo = {
      id: product._id,
      category: product.category,
      subCategory: product.subCategory
    };
    
    // Delete the product
    await product.remove();
    
    // Record metric for product deletion
    await SystemMetric.recordMetric({
      type: 'mechanical_product_metrics',
      name: 'product_deleted',
      value: 1,
      metadata: {
        productId: productInfo.id,
        category: productInfo.category,
        subCategory: productInfo.subCategory,
        userId: req.user._id,
        userRole: req.user.role
      },
      source: 'product_api'
    });
    
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ message: 'Error deleting product' });
  }
});

module.exports = router;
