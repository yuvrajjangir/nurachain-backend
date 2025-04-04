const mockProducts = require('./mockProducts');

// Extract transactions from mock products and format them
const productTransactions = mockProducts.flatMap(product => 
  product.transactions.map(t => ({
    transactionId: t.id,
    product: product._id,
    productTrackingNumber: product.trackingNumber,
    fromUser: `u${Math.floor(Math.random() * 1000)}`, // Placeholder, will be updated after user insertion
    toUser: `u${Math.floor(Math.random() * 1000)}`, // Placeholder, will be updated after user insertion
    quantity: t.quantity,
    status: t.status === 'completed' ? 'delivered' : 'in-transit',
    shipmentDetails: {
      carrier: 'FastTrack Logistics',
      trackingNumber: `FTL${Math.floor(Math.random() * 1000000000)}`,
      estimatedDelivery: new Date(t.date.getTime() + 7 * 24 * 60 * 60 * 1000),
      actualDelivery: t.status === 'completed' ? t.date : null,
      origin: {
        address: t.from,
        coordinates: [Math.random() * 180 - 90, Math.random() * 360 - 180] // Random coordinates
      },
      destination: {
        address: t.to,
        coordinates: [Math.random() * 180 - 90, Math.random() * 360 - 180] // Random coordinates
      },
      currentLocation: {
        address: t.status === 'completed' ? t.to : 'In Transit',
        coordinates: [Math.random() * 180 - 90, Math.random() * 360 - 180], // Random coordinates
        updatedAt: new Date()
      }
    },
    timeline: [
      {
        status: 'order-placed',
        location: {
          address: t.from,
          coordinates: [Math.random() * 180 - 90, Math.random() * 360 - 180]
        },
        timestamp: t.date,
        description: 'Order placed and confirmed'
      },
      {
        status: 'processing',
        location: {
          address: t.from,
          coordinates: [Math.random() * 180 - 90, Math.random() * 360 - 180]
        },
        timestamp: new Date(t.date.getTime() + 24 * 60 * 60 * 1000),
        description: 'Package being prepared for shipment'
      },
      {
        status: t.status === 'completed' ? 'delivered' : 'in-transit',
        location: {
          address: t.status === 'completed' ? t.to : 'In Transit',
          coordinates: [Math.random() * 180 - 90, Math.random() * 360 - 180]
        },
        timestamp: t.status === 'completed' ? new Date(t.date.getTime() + 48 * 60 * 60 * 1000) : new Date(),
        description: t.status === 'completed' ? 'Package delivered successfully' : 'Package in transit'
      }
    ],
    totalAmount: t.quantity * product.price,
    paymentStatus: 'paid',
    paymentDetails: {
      method: 'bank-transfer',
      transactionId: `PAY-${Math.random().toString(36).substr(2, 9)}`,
      paidAmount: t.quantity * product.price,
      paidAt: t.date
    },
    createdAt: t.date,
    updatedAt: new Date()
  }))
);

module.exports = productTransactions;
