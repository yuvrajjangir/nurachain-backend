const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const bcrypt = require('bcryptjs');
const Product = require('../models/Product');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const mockProducts = require('../data/mock/mockProducts');
const mockUsers = require('../data/mock/mockUsers');
const mockTransactions = require('../data/mock/mockTransactions');

// Load env vars from the correct location
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const seedDatabase = async () => {
  try {
    // Connect to MongoDB with the full URI from .env
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/nurachain';
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Connected to MongoDB');

    // Drop existing collections
    try {
      await mongoose.connection.db.dropCollection('products');
      await mongoose.connection.db.dropCollection('transactions');
      await mongoose.connection.db.dropCollection('users');
      console.log('Dropped collections');
    } catch (err) {
      console.log('Collections may not exist yet, continuing...');
    }

    // Insert mock users with hashed passwords
    const hashedUsers = await Promise.all(
      mockUsers.map(async user => ({
        ...user,
        password: await bcrypt.hash('password123', 10),
        createdAt: new Date(user.createdAt)
      }))
    );
    const users = await User.insertMany(hashedUsers);
    console.log(`Inserted ${users.length} users`);

    // Create a map of usernames to user IDs
    const userIdMap = users.reduce((map, user) => {
      map[user.username] = user._id;
      return map;
    }, {});

    // Insert mock products
    const products = await Product.insertMany(mockProducts.map(product => ({
      ...product,
      specifications: {
        ...product.specifications,
        dimensions: typeof product.specifications.dimensions === 'string' 
          ? { value: product.specifications.dimensions, units: '' }
          : product.specifications.dimensions
      }
    })));
    console.log(`Inserted ${products.length} products`);

    // Create a map of product tracking numbers to product IDs
    const productIdMap = products.reduce((map, product) => {
      map[product.trackingNumber] = {
        id: product._id,
        trackingNumber: product.trackingNumber
      };
      return map;
    }, {});

    // Update transactions with proper user and product references
    const updatedTransactions = mockTransactions.map(transaction => {
      // Get default users based on roles
      const defaultSupplier = users.find(u => u.role === 'supplier');
      const defaultCustomer = users.find(u => u.role === 'customer');

      // Find the product
      const productInfo = productIdMap[transaction.product] || {
        id: products[0]._id,
        trackingNumber: products[0].trackingNumber
      };

      return {
        ...transaction,
        fromUser: defaultSupplier._id, // Default to first supplier
        toUser: defaultCustomer._id, // Default to first customer
        product: productInfo.id,
        productTrackingNumber: productInfo.trackingNumber
      };
    });

    // Insert mock transactions
    const transactions = await Transaction.insertMany(updatedTransactions);
    console.log(`Inserted ${transactions.length} transactions`);

    console.log('Database seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
