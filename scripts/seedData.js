require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Product = require('../models/Product');
const Transaction = require('../models/Transaction');
const SystemMetric = require('../models/SystemMetric');

const connectDB = async () => {
  try {
    // Use direct connection string
    const mongoURI = 'mongodb://127.0.0.1:27017/nurachain';
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
      family: 4
    });
    console.log('Connected to MongoDB');
    return true;
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    console.log('\nPlease make sure MongoDB is running. You can start it using:');
    console.log('brew services start mongodb-community\n');
    return false;
  }
};

const seedData = async () => {
  try {
    // Connect to MongoDB
    const connected = await connectDB();
    if (!connected) {
      process.exit(1);
    }

    // Clear existing data
    await User.deleteMany({});
    await Product.deleteMany({});
    await Transaction.deleteMany({});
    await SystemMetric.deleteMany({});
    console.log('Cleared existing data');

    // Create admin user
    const admin = await User.create({
      username: 'admin',
      email: 'admin@nurachain.com',
      password: 'admin123',
      role: 'admin',
      verificationStatus: 'verified',
      profile: {
        firstName: 'Admin',
        lastName: 'User',
        phone: '1234567890'
      }
    });

    // Create manufacturer user
    const manufacturer = await User.create({
      username: 'manufacturer1',
      email: 'manufacturer@nurachain.com',
      password: 'manufacturer123',
      role: 'manufacturer',
      verificationStatus: 'verified',
      company: {
        name: 'Tech Manufacturing Inc',
        address: {
          street: '789 Manufacturing St',
          city: 'Tech City',
          state: 'CA',
          country: 'USA',
          postalCode: '12345'
        }
      }
    });

    // Create supplier
    const supplier = await User.create({
      username: 'supplier1',
      email: 'supplier@nurachain.com',
      password: 'supplier123',
      role: 'supplier',
      verificationStatus: 'verified',
      company: {
        name: 'Tech Supplies Inc',
        address: {
          street: '123 Supply St',
          city: 'Tech City',
          state: 'CA',
          country: 'USA',
          postalCode: '12345'
        }
      }
    });

    // Create distributor
    const distributor = await User.create({
      username: 'distributor1',
      email: 'distributor@nurachain.com',
      password: 'distributor123',
      role: 'distributor',
      verificationStatus: 'verified',
      company: {
        name: 'Global Distribution Co',
        address: {
          street: '456 Dist St',
          city: 'Dist City',
          state: 'NY',
          country: 'USA',
          postalCode: '67890'
        }
      }
    });

    // Create customer
    const customer = await User.create({
      username: 'customer1',
      email: 'customer@example.com',
      password: 'customer123',
      role: 'customer',
      verificationStatus: 'verified',
      profile: {
        firstName: 'John',
        lastName: 'Doe',
        phone: '9876543210'
      }
    });

    // Create sample products with updated timeline
    const products = await Product.create([
      {
        name: 'Industrial Bearing Set',
        category: 'Industrial Components',
        subCategory: 'Bearings',
        specifications: {
          material: 'Stainless Steel',
          size: '50mm',
          grade: 'AISI 440C',
          finish: 'Polished',
          standards: ['ISO 9001', 'ASTM A276'],
          dimensions: {
            length: 50,
            width: 50,
            height: 20,
            units: 'mm'
          },
          mechanicalProperties: {
            tensileStrength: 800,
            yieldStrength: 600,
            hardness: '58-60 HRC',
            torque: '100 Nm'
          },
          performance: {
            maxLoad: '5000 kg',
            operatingTemperature: '-40°C to 120°C',
            corrosionResistance: 'High',
            fatigueResistance: 'Excellent'
          }
        },
        manufacturer: manufacturer._id,
        currentOwner: manufacturer._id,
        currentLocation: 'Tech Manufacturing Inc, Tech City',
        status: 'manufactured',
        quantity: 100,
        price: 299.99,
        batchNumber: 'BRG-2024-001',
        manufacturingDate: new Date(),
        timeline: [{
          status: 'manufactured',
          title: 'Product Manufactured',
          date: new Date(),
          location: 'Tech Manufacturing Inc, Tech City',
          handler: manufacturer._id,
          description: 'Initial production complete'
        }]
      },
      {
        name: 'Precision Screw Set',
        category: 'Fasteners',
        subCategory: 'Screws',
        specifications: {
          material: 'Alloy Steel',
          size: 'M6',
          grade: '8.8',
          finish: 'Zinc Plated',
          standards: ['ISO 898-1', 'DIN 931'],
          threadSpecifications: {
            type: 'Metric',
            pitch: '1.0mm',
            threadCount: 1,
            threadDirection: 'Right-hand',
            threadClass: '6g'
          },
          dimensions: {
            length: 30,
            width: 5,
            height: 5,
            units: 'mm'
          },
          mechanicalProperties: {
            tensileStrength: 1000,
            yieldStrength: 800,
            hardness: '32-39 HRC',
            torque: '10 Nm'
          },
          performance: {
            maxLoad: '1000 kg',
            operatingTemperature: '-20°C to 100°C',
            corrosionResistance: 'Medium',
            fatigueResistance: 'Good'
          }
        },
        manufacturer: manufacturer._id,
        currentOwner: distributor._id,
        currentLocation: 'Global Distribution Co, Dist City',
        status: 'in-distribution',
        quantity: 500,
        price: 49.99,
        batchNumber: 'SCR-2024-001',
        manufacturingDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        timeline: [
          {
            status: 'manufactured',
            title: 'Product Manufactured',
            date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
            location: 'Tech Manufacturing Inc, Tech City',
            handler: manufacturer._id,
            description: 'Initial production complete'
          },
          {
            status: 'quality-check',
            title: 'Quality Check Passed',
            date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
            location: 'Tech Manufacturing Inc, Tech City',
            handler: manufacturer._id,
            description: 'Quality inspection passed'
          },
          {
            status: 'in-distribution',
            title: 'In Distribution',
            date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
            location: 'Global Distribution Co, Dist City',
            handler: distributor._id,
            description: 'Product received for distribution'
          }
        ]
      }
    ]);

    // Create sample transactions
    await Transaction.create([
      {
        transactionId: 'TXN-001',
        product: products[1]._id,
        productTrackingNumber: products[1].trackingNumber,
        fromUser: manufacturer._id,
        toUser: distributor._id,
        quantity: 500,
        status: 'delivered',
        shipmentDetails: {
          carrier: 'Express Logistics',
          trackingNumber: 'EXP-123456',
          origin: {
            address: 'Tech Manufacturing Inc, Tech City',
            coordinates: [0, 0]
          },
          destination: {
            address: 'Global Distribution Co, Dist City',
            coordinates: [0, 0]
          }
        },
        timeline: [{
          status: 'delivered',
          location: {
            address: 'Global Distribution Co, Dist City',
            coordinates: [0, 0]
          },
          notes: 'Delivery completed'
        }],
        totalAmount: 24995
      }
    ]);

    // Create sample metrics
    await SystemMetric.create([
      {
        type: 'inventory_metrics',
        name: 'total_products',
        value: products.length,
        source: 'system_seed',
        metadata: {
          timestamp: new Date()
        }
      },
      {
        type: 'transaction_volume',
        name: 'total_transactions',
        value: 1,
        source: 'system_seed',
        metadata: {
          timestamp: new Date()
        }
      }
    ]);

    console.log('Seed data created successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

// Run the seed function
seedData();
