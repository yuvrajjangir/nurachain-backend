const mongoose = require('mongoose');

const systemMetricSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: [
      'user_activity',
      'transaction_volume',
      'shipping_performance',
      'product_tracking',
      'system_performance',
      'quality_metrics',
      'supply_chain_efficiency',
      'delivery_performance',
      'inventory_metrics',
      'customer_satisfaction',
      'mechanical_product_metrics'
    ],
    required: true
  },
  name: {
    type: String,
    required: true
  },
  value: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  metadata: {
    category: String,
    subCategory: String,
    tags: [String],
    relatedProducts: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    }],
    relatedTransactions: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Transaction'
    }],
    relatedUsers: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    geolocation: {
      coordinates: [Number],
      address: String
    }
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  // For time-series data
  timeRange: {
    start: Date,
    end: Date
  },
  // For aggregated metrics
  aggregation: {
    type: {
      type: String,
      enum: ['sum', 'avg', 'min', 'max', 'count', 'median', 'percentile'],
    },
    period: {
      type: String,
      enum: ['hourly', 'daily', 'weekly', 'monthly', 'quarterly', 'yearly']
    },
    percentileValue: Number // For percentile aggregations
  },
  source: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'archived', 'flagged'],
    default: 'active'
  },
  // For anomaly detection
  anomalyDetection: {
    isAnomaly: {
      type: Boolean,
      default: false
    },
    score: Number,
    threshold: Number,
    detectedAt: Date
  },
  // For trend analysis
  trend: {
    direction: {
      type: String,
      enum: ['increasing', 'decreasing', 'stable', 'fluctuating']
    },
    percentChange: Number,
    comparedTo: {
      period: String,
      startDate: Date,
      endDate: Date
    }
  },
  // For alerts
  alerts: [{
    type: {
      type: String,
      enum: ['threshold_breach', 'anomaly_detected', 'trend_change', 'system_event']
    },
    message: String,
    severity: {
      type: String,
      enum: ['info', 'warning', 'critical']
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    acknowledged: {
      type: Boolean,
      default: false
    },
    acknowledgedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    acknowledgedAt: Date
  }]
}, {
  timestamps: true
});

// Create indexes for efficient querying
systemMetricSchema.index({ type: 1, timestamp: -1 });
systemMetricSchema.index({ 'metadata.category': 1, timestamp: -1 });
systemMetricSchema.index({ 'metadata.tags': 1 });
systemMetricSchema.index({ source: 1, timestamp: -1 });
systemMetricSchema.index({ 'metadata.relatedProducts': 1 });
systemMetricSchema.index({ 'metadata.relatedTransactions': 1 });
systemMetricSchema.index({ 'metadata.relatedUsers': 1 });
systemMetricSchema.index({ 'anomalyDetection.isAnomaly': 1 });
systemMetricSchema.index({ 'trend.direction': 1 });

// Static method to record a new metric
systemMetricSchema.statics.recordMetric = async function(metricData) {
  return await this.create(metricData);
};

// Static method to get metrics by type and time range
systemMetricSchema.statics.getMetrics = async function(type, startTime, endTime, options = {}) {
  const query = {
    type,
    timestamp: {
      $gte: startTime,
      $lte: endTime
    }
  };
  
  // Add optional filters
  if (options.category) {
    query['metadata.category'] = options.category;
  }
  
  if (options.tags && options.tags.length > 0) {
    query['metadata.tags'] = { $in: options.tags };
  }
  
  if (options.status) {
    query.status = options.status;
  }
  
  if (options.isAnomaly !== undefined) {
    query['anomalyDetection.isAnomaly'] = options.isAnomaly;
  }
  
  return await this.find(query)
    .sort({ timestamp: options.sort || -1 })
    .limit(options.limit || 0)
    .skip(options.skip || 0);
};

// Static method to get aggregated metrics
systemMetricSchema.statics.getAggregatedMetrics = async function(type, period, startTime, endTime, aggregationType = 'avg') {
  const aggregation = period || 'daily';
  const groupByDate = {
    hourly: { $hour: '$timestamp' },
    daily: { $dayOfMonth: '$timestamp' },
    weekly: { $week: '$timestamp' },
    monthly: { $month: '$timestamp' },
    quarterly: { $quarter: '$timestamp' },
    yearly: { $year: '$timestamp' }
  };

  const aggregationOperator = {
    avg: { $avg: '$value' },
    sum: { $sum: '$value' },
    min: { $min: '$value' },
    max: { $max: '$value' },
    count: { $sum: 1 }
  };

  return await this.aggregate([
    {
      $match: {
        type,
        timestamp: { $gte: startTime, $lte: endTime }
      }
    },
    {
      $group: {
        _id: {
          date: groupByDate[aggregation],
          year: { $year: '$timestamp' },
          month: { $month: '$timestamp' },
          day: { $dayOfMonth: '$timestamp' }
        },
        value: aggregationOperator[aggregationType],
        avgValue: { $avg: '$value' },
        minValue: { $min: '$value' },
        maxValue: { $max: '$value' },
        count: { $sum: 1 },
        metrics: { $push: '$$ROOT' }
      }
    },
    {
      $sort: {
        '_id.year': 1,
        '_id.month': 1,
        '_id.day': 1,
        '_id.date': 1
      }
    }
  ]);
};

// Static method to get dashboard metrics
systemMetricSchema.statics.getDashboardMetrics = async function(userId, role) {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  
  // Define metrics based on user role
  const metricTypes = ['transaction_volume', 'shipping_performance', 'delivery_performance'];
  
  if (['admin', 'manufacturer'].includes(role)) {
    metricTypes.push('quality_metrics', 'mechanical_product_metrics');
  }
  
  if (role === 'admin') {
    metricTypes.push('user_activity', 'system_performance');
  }
  
  // Get recent metrics
  const recentMetrics = await this.find({
    type: { $in: metricTypes },
    timestamp: { $gte: thirtyDaysAgo },
    status: 'active'
  }).sort({ timestamp: -1 }).limit(100);
  
  // Get aggregated metrics for the last 7 days
  const weeklyMetrics = await this.aggregate([
    {
      $match: {
        type: { $in: metricTypes },
        timestamp: { $gte: sevenDaysAgo },
        status: 'active'
      }
    },
    {
      $group: {
        _id: {
          type: '$type',
          day: { $dayOfMonth: '$timestamp' },
          month: { $month: '$timestamp' },
          year: { $year: '$timestamp' }
        },
        avgValue: { $avg: '$value' },
        count: { $sum: 1 }
      }
    },
    {
      $sort: {
        '_id.year': 1,
        '_id.month': 1,
        '_id.day': 1
      }
    }
  ]);
  
  // Get anomalies
  const anomalies = await this.find({
    'anomalyDetection.isAnomaly': true,
    timestamp: { $gte: sevenDaysAgo }
  }).sort({ timestamp: -1 }).limit(10);
  
  return {
    recentMetrics,
    weeklyMetrics,
    anomalies
  };
};

const SystemMetric = mongoose.model('SystemMetric', systemMetricSchema);

module.exports = SystemMetric;
