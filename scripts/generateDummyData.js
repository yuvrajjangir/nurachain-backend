const mongoose = require('mongoose');
const Product = require('../models/Product');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const { faker } = require('@faker-js/faker');
require('dotenv').config();

const categories = ['Fasteners', 'Tools & Equipment', 'Industrial Components', 'Hardware'];
const subCategories = {
  'Fasteners': ['Bolts', 'Nuts', 'Screws', 'Washers', 'Rivets'],
  'Tools & Equipment': ['Hand Tools', 'Power Tools', 'Measuring Tools', 'Safety Equipment'],
  'Industrial Components': ['Bearings', 'Valves', 'Pumps', 'Motors', 'Sensors'],
  'Hardware': ['Locks', 'Hinges', 'Handles', 'Brackets', 'Fasteners']
};
const materials = ['Steel', 'Aluminum', 'Brass', 'Copper', 'Stainless Steel'];
const grades = ['A', 'B', 'C', 'Premium', 'Standard'];
const sizes = ['Small', 'Medium', 'Large', 'Extra Large'];
const finishes = ['Polished', 'Matte', 'Brushed', 'Anodized', 'Coated'];
const locations = [
  'Mumbai Manufacturing Plant',
  'Delhi Distribution Center',
  'Bangalore Warehouse',
  'Chennai Facility',
  'Hyderabad Hub'
];

// Connect to MongoDB
const connectDB = async () => {
  try {
    const mongoURI = 'mongodb+srv://yuvraj88:Yuvraj%408888@cluster0.lemu8yk.mongodb.net/nurachain';
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
    return false;
  }
};

const generateDummyProducts = async () => {
  try {
    // Connect to MongoDB
    await connectDB();

    // Get admin user for manufacturer
    const admin = await User.findOne({ role: 'admin' });
    if (!admin) {
      console.error('Admin user not found');
      return;
    }

    // Clear existing products
    await Product.deleteMany({});
    console.log('Cleared existing products');

    // Generate 100 products
    const products = [];
    for (let i = 0; i < 100; i++) {
      const category = categories[Math.floor(Math.random() * categories.length)];
      const subCategory = subCategories[category][Math.floor(Math.random() * subCategories[category].length)];
      const material = materials[Math.floor(Math.random() * materials.length)];
      const grade = grades[Math.floor(Math.random() * grades.length)];
      const size = sizes[Math.floor(Math.random() * sizes.length)];
      const finish = finishes[Math.floor(Math.random() * finishes.length)];
      const location = locations[Math.floor(Math.random() * locations.length)];
      
      const product = new Product({
        name: `${category} ${subCategory} ${i + 1}`,
        description: `High-quality ${material} ${subCategory.toLowerCase()} for industrial use`,
        category,
        subCategory,
        trackingNumber: `TRK-${Date.now()}-${i}`,
        manufacturer: admin._id,
        currentOwner: admin._id,
        status: ['manufactured', 'quality-check', 'in-supply', 'in-distribution', 'delivered'][Math.floor(Math.random() * 5)],
        currentLocation: location,
        price: Math.floor(Math.random() * 10000) + 1000,
        quantity: Math.floor(Math.random() * 100) + 1,
        specifications: {
          material,
          size,
          grade,
          finish,
          standards: ['ISO 9001', 'ASME', 'ASTM'],
          threadSpecifications: {
            type: 'Metric',
            pitch: '1.5mm',
            threadCount: 20,
            threadDirection: 'Right-hand',
            threadClass: '6g'
          },
          dimensions: {
            length: Math.floor(Math.random() * 1000) + 100,
            width: Math.floor(Math.random() * 500) + 50,
            height: Math.floor(Math.random() * 300) + 30,
            diameter: Math.floor(Math.random() * 100) + 10,
            thickness: Math.floor(Math.random() * 50) + 5,
            units: 'mm'
          },
          mechanicalProperties: {
            tensileStrength: Math.floor(Math.random() * 1000) + 200,
            yieldStrength: Math.floor(Math.random() * 800) + 150,
            hardness: 'HRC 45',
            torque: '50 Nm'
          },
          performance: {
            maxLoad: '1000 kg',
            operatingTemperature: '-40°C to 120°C',
            corrosionResistance: 'High',
            fatigueResistance: 'Excellent'
          }
        },
        timeline: [
          {
            status: 'manufactured',
            title: 'Product Manufactured',
            date: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000),
            location,
            handler: admin._id,
            description: 'Product added to inventory'
          }
        ]
      });

      // Add quality check
      if (product.status !== 'manufactured') {
        product.timeline.push({
          status: 'quality-check',
          title: 'Quality Check Passed',
          date: new Date(product.timeline[0].date.getTime() + 24 * 60 * 60 * 1000),
          location,
          handler: admin._id,
          description: 'Product passed quality check'
        });
      }

      // Add in-supply status if applicable
      if (['in-supply', 'in-distribution', 'delivered'].includes(product.status)) {
        product.timeline.push({
          status: 'in-supply',
          title: 'Product in Supply',
          date: new Date(product.timeline[1].date.getTime() + 24 * 60 * 60 * 1000),
          location,
          handler: admin._id,
          description: 'Product entered supply chain'
        });
      }

      // Add distribution if applicable
      if (['in-distribution', 'delivered'].includes(product.status)) {
        product.timeline.push({
          status: 'in-distribution',
          title: 'Product in Distribution',
          date: new Date(product.timeline[2].date.getTime() + 48 * 60 * 60 * 1000),
          location: locations[Math.floor(Math.random() * locations.length)],
          handler: admin._id,
          description: 'Product entered distribution network'
        });
      }

      // Add delivery if applicable
      if (product.status === 'delivered') {
        product.timeline.push({
          status: 'delivered',
          title: 'Product Delivered',
          date: new Date(product.timeline[3].date.getTime() + 72 * 60 * 60 * 1000),
          location: locations[Math.floor(Math.random() * locations.length)],
          handler: admin._id,
          description: 'Product delivered to final destination'
        });
      }

      products.push(product);
    }

    // Save all products
    await Product.insertMany(products);
    console.log('Generated 100 dummy products');

    // Generate transactions for products
    for (const product of products) {
      if (product.status !== 'manufactured') {
        await Transaction.create({
          transactionId: `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          product: product._id,
          productTrackingNumber: product.trackingNumber,
          fromUser: admin._id,
          toUser: admin._id,
          quantity: product.quantity,
          status: product.status === 'delivered' ? 'delivered' : 'in-transit',
          shipmentDetails: {
            carrier: 'Internal',
            trackingNumber: product.trackingNumber,
            origin: {
              address: product.timeline[0].location,
              coordinates: [0, 0]
            },
            destination: {
              address: product.timeline[product.timeline.length - 1].location,
              coordinates: [0, 0]
            }
          },
          timeline: product.timeline.map(entry => ({
            status: entry.status === 'delivered' ? 'delivered' : 'in-transit',
            location: {
              address: entry.location,
              coordinates: [0, 0]
            },
            notes: entry.description
          })),
          totalAmount: product.price * product.quantity
        });
      }
    }
    console.log('Generated transactions for products');

    console.log('Dummy data generation completed');
    process.exit(0);
  } catch (error) {
    console.error('Error generating dummy data:', error);
    process.exit(1);
  }
};

generateDummyProducts(); 