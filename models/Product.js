const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: false,
  },
  trackingNumber: {
    type: String,
    required: true,
    unique: true,
  },
  category: {
    type: String,
    required: true,
    enum: ['Fasteners', 'Tools & Equipment', 'Industrial Components', 'Hardware'],
  },
  subCategory: {
    type: String,
    required: true,
  },
  specifications: {
    material: {
      type: String,
      required: true,
    },
    size: {
      type: String,
      required: true,
    },
    grade: {
      type: String,
      required: true,
    },
    finish: String,
    standards: [String],
    threadSpecifications: {
      type: {
        type: String,
        enum: ['Metric', 'Imperial', 'UNC', 'UNF', 'NPT', 'None'],
        default: 'None'
      },
      pitch: String,
      threadCount: Number,
      threadDirection: {
        type: String,
        enum: ['Right-hand', 'Left-hand', 'None'],
        default: 'None'
      },
      threadClass: String
    },
    dimensions: {
      length: Number,
      width: Number,
      height: Number,
      diameter: Number,
      thickness: Number,
      units: {
        type: String,
        enum: ['mm', 'cm', 'in', 'ft'],
        default: 'mm'
      }
    },
    mechanicalProperties: {
      tensileStrength: Number,
      yieldStrength: Number,
      hardness: String,
      torque: String
    },
    performance: {
      maxLoad: String,
      operatingTemperature: String,
      corrosionResistance: String,
      fatigueResistance: String
    }
  },
  manufacturer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  currentLocation: {
    type: String,
    required: true
  },
  currentOwner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    required: true,
    enum: ['manufactured', 'quality-check', 'in-supply', 'in-distribution', 'delivered'],
    default: 'manufactured'
  },
  quantity: {
    type: Number,
    required: true,
    min: 0
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  timeline: [{
    status: {
      type: String,
      required: true,
      enum: ['manufactured', 'quality-check', 'in-supply', 'in-distribution', 'delivered']
    },
    title: String,
    date: {
      type: Date,
      default: Date.now
    },
    location: String,
    handler: String,
    description: String,
    metadata: mongoose.Schema.Types.Mixed
  }],
  transactions: [{
    id: String,
    date: Date,
    from: String,
    to: String,
    quantity: Number,
    status: String
  }],
  qrCode: String,
  batchNumber: String,
  manufacturingDate: Date,
  expiryDate: Date,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Create indexes
productSchema.index({ trackingNumber: 1 }, { unique: true });
productSchema.index({ category: 1 });
productSchema.index({ 'specifications.material': 1 });
productSchema.index({ status: 1 });
productSchema.index({ manufacturer: 1 });
productSchema.index({ batchNumber: 1 });

// Generate tracking number before saving
productSchema.pre('save', function(next) {
  if (!this.trackingNumber) {
    // Generate tracking number based on category
    const prefix = this.category === 'Fasteners' ? 'FAS' :
                  this.category === 'Tools & Equipment' ? 'TLS' :
                  this.category === 'Industrial Components' ? 'IND' : 'HRD';
    
    this.trackingNumber = `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 5)}`.toUpperCase();
  }
  next();
});

// Update the updatedAt field on save
productSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
