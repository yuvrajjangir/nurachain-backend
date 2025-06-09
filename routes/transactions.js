const express = require('express');
const Transaction = require('../models/Transaction');
const Product = require('../models/Product');
const { protect, restrictTo } = require('../middleware/auth');

const router = express.Router();

// Get all transactions
router.get('/', protect, async (req, res) => {
  try {
    const transactions = await Transaction.find()
      .populate('product', 'name trackingNumber price')
      .populate('fromUser', 'username email company')
      .populate('toUser', 'username email company')
      .sort('-createdAt');

    res.json(transactions);
  } catch (error) {
    console.error('Transaction fetch error:', error);
    res.status(500).json({ message: 'Error fetching transactions' });
  }
});

// Get transaction by ID
router.get('/:id', protect, async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id)
      .populate('product', 'name trackingNumber price')
      .populate('fromUser', 'username email company')
      .populate('toUser', 'username email company');
    
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }
    
    res.json(transaction);
  } catch (error) {
    console.error('Transaction fetch error:', error);
    res.status(500).json({ message: 'Error fetching transaction' });
  }
});

// Create new transaction
router.post('/', protect, async (req, res) => {
  try {
    const { productId, toUserId, quantity, shipmentDetails } = req.body;
    
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    if (product.quantity < quantity) {
      return res.status(400).json({ message: 'Insufficient product quantity' });
    }
    
    const transaction = await Transaction.create({
      transactionId: 'TXN-' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
      product: productId,
      productTrackingNumber: product.trackingNumber,
      fromUser: req.user._id,
      toUser: toUserId,
      quantity,
      status: 'processing',
      totalAmount: product.price * quantity,
      shipmentDetails: {
        ...shipmentDetails,
        origin: {
          address: product.currentLocation,
          coordinates: [0, 0] // Default coordinates
        }
      },
      timeline: [{
        status: 'processing',
        location: {
          address: product.currentLocation,
          coordinates: [0, 0]
      },
        notes: 'Transaction initiated'
      }]
    });
    
    // Update product quantity
    product.quantity -= quantity;
    await product.save();
    
    res.status(201).json(transaction);
  } catch (error) {
    console.error('Transaction creation error:', error);
    res.status(500).json({ message: 'Error creating transaction' });
  }
});

// Update transaction status
router.patch('/:id/status', protect, async (req, res) => {
  try {
    const { status, location, notes } = req.body;
    const transaction = await Transaction.findById(req.params.id);
    
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }
    
    transaction.status = status;
    transaction.timeline.push({
      status,
      location: {
        address: location || transaction.shipmentDetails.destination.address,
        coordinates: [0, 0]
      },
      notes: notes || `Status updated to ${status}`
    });
    
    if (status === 'completed') {
      transaction.shipmentDetails.actualDelivery = new Date();
    }
    
    await transaction.save();
    res.json(transaction);
  } catch (error) {
    console.error('Transaction update error:', error);
    res.status(500).json({ message: 'Error updating transaction' });
  }
});

// Get transactions for a specific product
router.get('/product/:productId', protect, async (req, res) => {
  try {
    const transactions = await Transaction.find({ product: req.params.productId })
      .populate('fromUser', 'username company')
      .populate('toUser', 'username company')
      .sort('-createdAt');

    const formattedTransactions = transactions.map(tx => ({
      id: tx._id,
      date: tx.createdAt,
      from: tx.fromUser?.company?.name || tx.fromUser?.username || 'N/A',
      to: tx.toUser?.company?.name || tx.toUser?.username || 'N/A',
      status: tx.status,
      type: tx.type || 'transfer',
      amount: tx.totalAmount
    }));

    res.json(formattedTransactions);
  } catch (error) {
    console.error('Error fetching product transactions:', error);
    res.status(500).json({ message: 'Error fetching product transactions' });
  }
});

module.exports = router;
