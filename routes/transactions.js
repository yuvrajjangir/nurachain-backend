const express = require('express');
const Transaction = require('../models/Transaction');
const Product = require('../models/Product');
const { protect, restrictTo } = require('../middleware/auth');
const mockTransactions = require('../data/mock/mockTransactions');

const router = express.Router();

// Get all transactions
router.get('/', protect, async (req, res) => {
  try {
    // Try to get transactions from database
    let transactions = [];
    
    try {
      transactions = await Transaction.find()
        .populate('product', 'name trackingId price')
        .populate('fromUser', 'username email')
        .populate('toUser', 'username email')
        .sort('-createdAt')
        .lean(); // Convert to plain JavaScript objects
    } catch (error) {
      console.warn('Error fetching transactions from database, using mock data', error);
    }
    
    // If no transactions in database, use mock data
    if (transactions.length === 0) {
      transactions = mockTransactions;
    }
    
    // Ensure all required fields are present
    const sanitizedTransactions = transactions.map(transaction => ({
      _id: transaction._id?.toString() || transaction.id,
      productTrackingNumber: transaction.productTrackingNumber || 'N/A',
      product: {
        name: transaction.product?.name || transaction.productId || 'N/A',
        trackingId: transaction.product?.trackingId || transaction.trackingNumber || 'N/A',
        price: transaction.product?.price || transaction.price || 0
      },
      fromUser: {
        username: transaction.fromUser?.username || transaction.seller?.name || 'N/A',
        email: transaction.fromUser?.email || `${transaction.seller?.name.toLowerCase().replace(/\s+/g, '.')}@example.com` || 'N/A'
      },
      toUser: {
        username: transaction.toUser?.username || transaction.buyer?.name || 'N/A',
        email: transaction.toUser?.email || `${transaction.buyer?.name.toLowerCase().replace(/\s+/g, '.')}@example.com` || 'N/A'
      },
      quantity: transaction.quantity || 0,
      status: transaction.status || 'pending',
      totalAmount: transaction.totalAmount || transaction.totalValue || 0,
      shipmentDetails: transaction.shipmentDetails || transaction.shipment || {},
      createdAt: transaction.createdAt,
      updatedAt: transaction.updatedAt
    }));

    res.json(sanitizedTransactions);
  } catch (error) {
    console.error('Transaction fetch error:', error);
    res.status(400).json({ message: error.message });
  }
});

// Get transaction by ID
router.get('/:id', protect, async (req, res) => {
  try {
    // Try to find in database first
    let transaction = null;
    
    try {
      transaction = await Transaction.findById(req.params.id)
        .populate('product', 'name trackingId price')
        .populate('fromUser', 'username email')
        .populate('toUser', 'username email');
    } catch (error) {
      console.warn('Error fetching transaction from database', error);
    }
    
    // If not found in database, check mock data
    if (!transaction) {
      transaction = mockTransactions.find(t => t.id === req.params.id);
    }
    
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }
    
    res.json(transaction);
  } catch (error) {
    // If error is because ID format is invalid, check mock data
    const mockTransaction = mockTransactions.find(t => t.id === req.params.id);
    if (mockTransaction) {
      return res.json(mockTransaction);
    }
    
    res.status(400).json({ message: error.message });
  }
});

// Create new transaction
router.post('/', protect, async (req, res) => {
  try {
    const { productId, toUserId, quantity } = req.body;
    
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    if (product.quantity < quantity) {
      return res.status(400).json({ message: 'Insufficient product quantity' });
    }
    
    const transaction = await Transaction.create({
      product: productId,
      fromUser: req.user._id,
      toUser: toUserId,
      quantity,
      totalAmount: product.price * quantity,
      shipmentDetails: {
        ...req.body.shipmentDetails,
        origin: product.currentLocation,
      },
    });
    
    // Update product quantity
    product.quantity -= quantity;
    await product.save();
    
    res.status(201).json(transaction);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update transaction status
router.patch('/:id/status', protect, async (req, res) => {
  try {
    const { status } = req.body;
    const transaction = await Transaction.findById(req.params.id);
    
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }
    
    transaction.status = status;
    if (status === 'completed') {
      transaction.shipmentDetails.actualDelivery = new Date();
    }
    
    await transaction.save();
    res.json(transaction);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
