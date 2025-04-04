const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  role: {
    type: String,
    enum: ['admin', 'manufacturer', 'supplier', 'distributor', 'customer', 'quality-inspector'],
    default: 'customer',
  },
  permissions: [{
    type: String,
    enum: [
      'view_dashboard',
      'manage_users',
      'manage_products',
      'manage_transactions',
      'view_reports',
      'manage_settings',
      'approve_users',
      'track_shipments'
    ]
  }],
  profile: {
    firstName: {
      type: String,
      default: ''
    },
    lastName: {
      type: String,
      default: ''
    },
    phone: {
      type: String,
      default: ''
    },
    avatar: {
      type: String,
      default: ''
    },
    bio: {
      type: String,
      default: ''
    }
  },
  company: {
    name: {
      type: String,
      default: ''
    },
    address: {
      street: {
        type: String,
        default: ''
      },
      city: {
        type: String,
        default: ''
      },
      state: {
        type: String,
        default: ''
      },
      country: {
        type: String,
        default: ''
      },
      postalCode: {
        type: String,
        default: ''
      }
    },
    website: {
      type: String,
      default: ''
    },
    taxId: {
      type: String,
      default: ''
    }
  },
  verificationStatus: {
    type: String,
    enum: ['pending', 'verified', 'rejected'],
    default: 'pending'
  },
  specializations: {
    type: [String],
    required: function() {
      return this.role === 'quality-inspector';
    },
    validate: {
      validator: function(v) {
        return this.role !== 'quality-inspector' || v.length > 0;
      },
      message: 'Quality inspectors must have at least one specialization'
    }
  },
  certifications: {
    type: [String],
    required: function() {
      return this.role === 'quality-inspector';
    },
    validate: {
      validator: function(v) {
        return this.role !== 'quality-inspector' || v.length > 0;
      },
      message: 'Quality inspectors must have at least one certification'
    }
  },
  yearsOfExperience: {
    type: Number,
    required: function() {
      return this.role === 'quality-inspector';
    },
    min: [0, 'Years of experience must be a positive number']
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  active: {
    type: Boolean,
    default: true,
    select: false
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Set default permissions based on role
userSchema.pre('save', function(next) {
  if (this.isNew || this.isModified('role')) {
    switch (this.role) {
      case 'admin':
        this.permissions = [
          'view_dashboard',
          'manage_users',
          'manage_products',
          'manage_transactions',
          'view_reports',
          'manage_settings',
          'approve_users',
          'track_shipments'
        ];
        break;
      case 'manufacturer':
        this.permissions = [
          'view_dashboard',
          'manage_products',
          'track_shipments',
          'view_reports'
        ];
        break;
      case 'supplier':
        this.permissions = [
          'view_dashboard',
          'manage_products',
          'track_shipments',
          'view_reports'
        ];
        break;
      case 'distributor':
        this.permissions = [
          'view_dashboard',
          'track_shipments',
          'view_reports'
        ];
        break;
      case 'customer':
        this.permissions = [
          'track_shipments'
        ];
        break;
      case 'quality-inspector':
        this.permissions = [
          'view_dashboard',
          'view_reports'
        ];
        break;
    }
  }
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Check if password was changed after token was issued
userSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

// Check if user has required permissions
userSchema.methods.hasPermission = function(requiredPermissions) {
  if (!Array.isArray(requiredPermissions)) {
    requiredPermissions = [requiredPermissions];
  }
  return requiredPermissions.every(permission => this.permissions.includes(permission));
};

const User = mongoose.model('User', userSchema);

module.exports = User;
