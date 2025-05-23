const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');

const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const transactionRoutes = require('./routes/transactions');
const metricsRoutes = require('./routes/metrics');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/metrics', metricsRoutes);

// Test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'Server is running!' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  console.error('Stack:', err.stack);
  res.status(500).json({ message: 'Something went wrong!', error: err.message });
});

const PORT = process.env.PORT || 5000;

console.log('Attempting to connect to MongoDB...');
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('Connected to MongoDB successfully');
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log('\nAvailable Authentication Routes:');
      console.log('- POST   /api/auth/create-first-admin  (Create first admin)');
      console.log('- POST   /api/auth/create-admin       (Admin creates another admin)');
      console.log('- POST   /api/auth/register          (Register new user)');
      console.log('- POST   /api/auth/login            (Login user)');
      console.log('- GET    /api/auth/me               (Get current user)');
      console.log('- GET    /api/auth/users            (Admin: Get all users)');
      console.log('- GET    /api/auth/pending-verifications (Admin: Get pending users)');
      console.log('- PATCH  /api/auth/verify/:userId   (Admin: Verify/reject user)');
      console.log('- GET    /api/auth/check-admin      (Check if admin exists)');
      
      console.log('\nAvailable Product Routes:');
      console.log('- GET    /api/products              (Get all products)');
      console.log('- GET    /api/products/track/:id    (Track product)');
      console.log('- POST   /api/products              (Create product)');
      console.log('- PATCH  /api/products/:id          (Update product)');
      console.log('- PATCH  /api/products/:id/status   (Update product status)');
      
      console.log('\nAvailable Transaction Routes:');
      console.log('- GET    /api/transactions          (Get all transactions)');
      console.log('- POST   /api/transactions          (Create transaction)');
      console.log('- GET    /api/transactions/:id      (Get transaction)');
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    console.error('Error details:', {
      name: err.name,
      message: err.message,
      code: err.code,
      codeName: err.codeName
    });
  });
