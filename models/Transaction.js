const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  transactionId: {
    type: String,
    required: true,
    unique: true
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  productTrackingNumber: {
    type: String,
    required: true,
  },
  fromUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  toUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'in-transit', 'delivered', 'completed', 'cancelled', 'delayed'],
    default: 'pending',
  },
  shipmentDetails: {
    carrier: {
      type: String,
      required: true
    },
    trackingNumber: {
      type: String,
      required: true
    },
    estimatedDelivery: Date,
    actualDelivery: Date,
    origin: {
      address: {
        type: String,
        required: true
      },
      coordinates: {
        type: [Number],
        required: true
      },
      contactPerson: String,
      contactPhone: String
    },
    destination: {
      address: {
        type: String,
        required: true
      },
      coordinates: {
        type: [Number],
        required: true
      },
      contactPerson: String,
      contactPhone: String
    },
    currentLocation: {
      address: String,
      coordinates: {
        type: [Number]
      },
      updatedAt: Date,
      status: String
    },
    packageDetails: {
      weight: Number,
      dimensions: {
        length: Number,
        width: Number,
        height: Number,
        units: {
          type: String,
          enum: ['cm', 'in'],
          default: 'cm'
        }
      },
      packageCount: {
        type: Number,
        default: 1
      },
      specialHandling: [String]
    },
    deliveryInstructions: String,
    signatureRequired: {
      type: Boolean,
      default: false
    },
    insurance: {
      isInsured: {
        type: Boolean,
        default: false
      },
      value: Number,
      provider: String,
      policyNumber: String
    },
    customsInformation: {
      required: {
        type: Boolean,
        default: false
      },
      declarationNumber: String,
      hsCode: String,
      dutyAmount: Number
    },
    delays: [{
      reason: String,
      location: String,
      reportedAt: Date,
      estimatedResolution: Date,
      resolvedAt: Date,
      status: {
        type: String,
        enum: ['active', 'resolved'],
        default: 'active'
      }
    }]
  },
  timeline: [{
    status: {
      type: String,
      enum: ['order-placed', 'processing', 'picked', 'shipped', 'in-transit', 'out-for-delivery', 'delivered', 'cancelled', 'delayed', 'exception'],
      required: true
    },
    location: {
      address: String,
      coordinates: {
        type: [Number],
        required: true
      }
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    notes: String,
    handledBy: {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      name: String,
      role: String
    }
  }],
  totalAmount: {
    type: Number,
    required: true,
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded', 'partially-paid'],
    default: 'pending'
  },
  paymentDetails: {
    method: String,
    transactionId: String,
    paidAt: Date,
    amount: Number,
    currency: {
      type: String,
      default: 'USD'
    },
    paymentTerms: String,
    invoiceNumber: String
  },
  documents: [{
    type: {
      type: String,
      enum: ['invoice', 'bill-of-lading', 'packing-slip', 'customs-declaration', 'insurance', 'quality-certificate', 'delivery-receipt'],
      required: true
    },
    url: String,
    uploadedAt: Date,
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    verified: {
      type: Boolean,
      default: false
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    verifiedAt: Date
  }],
  qualityChecks: [{
    inspectorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    date: Date,
    result: {
      type: String,
      enum: ['passed', 'failed', 'pending'],
      default: 'pending'
    },
    notes: String,
    attachments: [String]
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
});

transactionSchema.index({ transactionId: 1 });
transactionSchema.index({ 'shipmentDetails.trackingNumber': 1 });
transactionSchema.index({ status: 1, createdAt: -1 });
transactionSchema.index({ fromUser: 1 });
transactionSchema.index({ toUser: 1 });
transactionSchema.index({ product: 1 });
transactionSchema.index({ productTrackingNumber: 1 });

transactionSchema.pre('save', function(next) {
  if (!this.transactionId) {
    this.transactionId = 'TXN' + Date.now() + Math.random().toString(36).substr(2, 5).toUpperCase();
  }
  this.updatedAt = new Date();
  next();
});

const Transaction = mongoose.model('Transaction', transactionSchema);

module.exports = Transaction;
