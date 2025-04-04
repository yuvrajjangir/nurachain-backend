const mockMetrics = {
  // Dashboard metrics
  dashboard: {
    totalProducts: 150,
    activeShipments: 45,
    completedTransactions: 230,
    delayedShipments: 8,
    productTrends: {
      totalProducts: 12,
      activeShipments: 8,
      completedTransactions: -3,
      delayedShipments: -5,
    },
    monthlyStats: [
      { month: 'Jan', shipments: 65, revenue: 12500 },
      { month: 'Feb', shipments: 75, revenue: 15000 },
      { month: 'Mar', shipments: 85, revenue: 17500 },
      { month: 'Apr', shipments: 95, revenue: 19000 },
      { month: 'May', shipments: 80, revenue: 16000 },
      { month: 'Jun', shipments: 90, revenue: 18000 },
      { month: 'Jul', shipments: 105, revenue: 21000 },
      { month: 'Aug', shipments: 115, revenue: 23000 },
      { month: 'Sep', shipments: 100, revenue: 20000 },
      { month: 'Oct', shipments: 95, revenue: 19000 },
      { month: 'Nov', shipments: 110, revenue: 22000 },
      { month: 'Dec', shipments: 120, revenue: 24000 }
    ],
    productDistribution: [
      { id: 'Fasteners', value: 35, color: '#3f51b5' },
      { id: 'Tools', value: 25, color: '#f50057' },
      { id: 'Components', value: 20, color: '#4caf50' },
      { id: 'Hardware', value: 20, color: '#ff9800' }
    ],
    categoryStatus: [
      { 
        category: 'Fasteners', 
        completed: 28, 
        pending: 5, 
        delayed: 2 
      },
      { 
        category: 'Tools', 
        completed: 18, 
        pending: 4, 
        delayed: 3 
      },
      { 
        category: 'Components', 
        completed: 15, 
        pending: 3, 
        delayed: 2 
      },
      { 
        category: 'Hardware', 
        completed: 16, 
        pending: 3, 
        delayed: 1 
      }
    ],
    recentActivities: [
      {
        id: 1,
        type: 'shipment',
        message: 'Shipment #SH-2025-06-001 has been delivered',
        time: '10 minutes ago',
        status: 'Completed',
      },
      {
        id: 2,
        type: 'transaction',
        message: 'New transaction #TX-2025-06-042 has been created',
        time: '1 hour ago',
        status: 'Pending',
      },
      {
        id: 3,
        type: 'product',
        message: 'Product "M8 Hex Bolt" inventory updated',
        time: '3 hours ago',
        status: 'Completed',
      },
      {
        id: 4,
        type: 'shipment',
        message: 'Shipment #SH-2025-06-002 is delayed',
        time: '5 hours ago',
        status: 'Delayed',
      },
      {
        id: 5,
        type: 'transaction',
        message: 'Transaction #TX-2025-06-038 payment received',
        time: '6 hours ago',
        status: 'Completed',
      },
      {
        id: 6,
        type: 'product',
        message: 'New product "Digital Caliper" added to inventory',
        time: '8 hours ago',
        status: 'Completed',
      },
      {
        id: 7,
        type: 'shipment',
        message: 'Shipment #SH-2025-06-003 has left the warehouse',
        time: '10 hours ago',
        status: 'In Progress',
      },
      {
        id: 8,
        type: 'transaction',
        message: 'Transaction #TX-2025-06-035 awaiting payment',
        time: '12 hours ago',
        status: 'Pending',
      },
    ],
  },

  analytics: {
    // User statistics
    users: {
      total: 150,
      byRole: [
        { role: 'admin', count: 5 },
        { role: 'manufacturer', count: 35 },
        { role: 'supplier', count: 45 },
        { role: 'distributor', count: 65 }
      ],
      byStatus: [
        { status: 'active', count: 120 },
        { status: 'pending', count: 20 },
        { status: 'suspended', count: 10 }
      ],
      byLocation: [
        { location: 'North America', count: 80 },
        { location: 'Europe', count: 40 },
        { location: 'Asia', count: 30 }
      ],
      growth: [
        { month: 'Jan', users: 100 },
        { month: 'Feb', users: 110 },
        { month: 'Mar', users: 125 },
        { month: 'Apr', users: 150 }
      ]
    },

    // Product statistics
    products: {
      total: 150,
      byCategory: [
        { category: 'Fasteners', count: 60 },
        { category: 'Tools', count: 35 },
        { category: 'Components', count: 30 },
        { category: 'Hardware', count: 25 }
      ],
      byStatus: [
        { status: 'manufactured', count: 45 },
        { status: 'quality-check', count: 25 },
        { status: 'in-supply', count: 40 },
        { status: 'in-distribution', count: 40 }
      ],
      topManufacturers: [
        { name: 'XYZ Manufacturing', count: 35 },
        { name: 'PrecisionTech Tools', count: 25 },
        { name: 'BearingTech Industries', count: 20 },
        { name: 'MetalCraft Solutions', count: 15 },
        { name: 'FastenPro Manufacturing', count: 15 }
      ]
    },

    // Supply chain metrics
    supplyChain: {
      averageDeliveryTime: 4.5, // days
      onTimeDeliveryRate: 92, // percentage
      qualityRejectionRate: 1.2, // percentage
      inventoryTurnover: 8.5, // times per year
      locationEfficiency: [
        { location: 'New York DC', efficiency: 94 },
        { location: 'Chicago Hub', efficiency: 91 },
        { location: 'Atlanta Center', efficiency: 89 },
        { location: 'Phoenix WH', efficiency: 93 }
      ],
      shipmentStatus: {
        onTime: 85,
        delayed: 12,
        critical: 3
      },
      qualityMetrics: {
        passed: 95,
        conditionalPass: 4,
        failed: 1
      }
    }
  },

  // Time-based filters
  timeFilters: {
    today: {
      totalProducts: 145,
      activeShipments: 42,
      completedTransactions: 225,
      delayedShipments: 9,
      productTrends: {
        totalProducts: 8,
        activeShipments: 5,
        completedTransactions: -2,
        delayedShipments: -3,
      },
    },
    thisWeek: {
      totalProducts: 148,
      activeShipments: 44,
      completedTransactions: 228,
      delayedShipments: 8,
      productTrends: {
        totalProducts: 10,
        activeShipments: 7,
        completedTransactions: -2,
        delayedShipments: -4,
      },
    },
    thisMonth: {
      totalProducts: 150,
      activeShipments: 45,
      completedTransactions: 230,
      delayedShipments: 8,
      productTrends: {
        totalProducts: 12,
        activeShipments: 8,
        completedTransactions: -3,
        delayedShipments: -5,
      },
    },
    thisYear: {
      totalProducts: 155,
      activeShipments: 48,
      completedTransactions: 235,
      delayedShipments: 7,
      productTrends: {
        totalProducts: 15,
        activeShipments: 10,
        completedTransactions: -5,
        delayedShipments: -6,
      },
    },
  },
};

module.exports = mockMetrics;
