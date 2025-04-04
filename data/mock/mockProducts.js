const generateTransactions = (product) => {
  const baseTransactions = [
    {
      id: `TXN-${product.trackingNumber}-001`,
      quantity: Math.floor(Math.random() * 5000) + 100,
      date: new Date('2025-04-01T10:00:00Z'),
      status: 'completed',
      from: product.manufacturer,
      to: 'Distribution Center'
    },
    {
      id: `TXN-${product.trackingNumber}-002`,
      quantity: Math.floor(Math.random() * 3000) + 100,
      date: new Date('2025-04-02T10:00:00Z'),
      status: 'completed',
      from: 'Distribution Center',
      to: 'Regional Warehouse'
    },
    {
      id: `TXN-${product.trackingNumber}-003`,
      quantity: Math.floor(Math.random() * 1000) + 50,
      date: new Date('2025-04-03T10:00:00Z'),
      status: 'in-progress',
      from: 'Regional Warehouse',
      to: 'Local Store'
    }
  ];
  return baseTransactions;
};

const mockProducts = [
  {
    name: 'Hex Head Bolt M8x30',
    trackingNumber: 'TRK-F-001',
    category: 'Fasteners',
    specifications: {
      material: 'Stainless Steel 304',
      dimensions: { value: 'M8x30', units: 'mm' },
      weight: 0.025,
      threadType: 'Metric Coarse',
      standard: 'ISO 4014',
      finish: 'Plain',
      tensileStrength: '800 MPa'
    },
    manufacturer: 'XYZ Manufacturing',
    currentLocation: 'Distribution Center, New York',
    currentOwner: 'FastTrack Logistics',
    status: 'in-distribution',
    quantity: 5000,
    price: 0.75,
    timeline: [
      {
        status: 'manufactured',
        title: 'Production Complete',
        date: new Date('2025-04-01T10:00:00Z'),
        location: 'XYZ Manufacturing, Ohio',
        handler: 'John Smith',
        description: 'Batch production completed and passed initial QC',
      },
      {
        status: 'quality-check',
        title: 'Quality Check',
        date: new Date('2025-04-02T10:00:00Z'),
        location: 'XYZ Manufacturing, Ohio',
        handler: 'QC Team',
        description: 'Detailed quality inspection',
        notes: 'Performance testing in progress'
      },
      {
        status: 'in-supply',
        title: 'In Supply Chain',
        date: new Date('2025-04-04T10:00:00Z'),
        location: 'Regional Warehouse, Chicago',
        handler: 'Supply Chain Team',
        description: 'Product entered supply chain',
        notes: 'Ready for distribution'
      },
      {
        status: 'in-distribution',
        title: 'Distribution Started',
        date: new Date('2025-04-06T10:00:00Z'),
        location: 'Distribution Center, New York',
        handler: 'Distribution Team',
        description: 'Distribution phase initiated',
        notes: 'On schedule'
      }
    ],
    transactions: []
  },
  {
    name: 'Socket Head Screw M6x25',
    trackingNumber: 'TRK-F-002',
    category: 'Fasteners',
    specifications: {
      material: 'Alloy Steel',
      dimensions: { value: 'M6x25', units: 'mm' },
      weight: 0.015,
      threadType: 'Metric Coarse',
      standard: 'ISO 4762',
      finish: 'Black Oxide',
      tensileStrength: '1200 MPa'
    },
    manufacturer: 'FastenPro Manufacturing',
    currentLocation: 'Manufacturing Plant, Phoenix',
    currentOwner: 'FastenPro Manufacturing',
    status: 'manufactured',
    quantity: 8000,
    price: 0.45,
    timeline: [
      {
        status: 'manufactured',
        title: 'Product Manufactured',
        date: new Date('2025-04-01T10:00:00Z'),
        location: 'FastenPro Manufacturing, Phoenix',
        handler: 'Production Team B',
        description: 'Batch production completed',
        notes: 'Initial testing passed'
      }
    ],
    transactions: []
  },
  {
    name: 'Wing Nut M10',
    trackingNumber: 'TRK-F-003',
    category: 'Fasteners',
    specifications: {
      material: 'Zinc-Plated Steel',
      dimensions: { value: 'M10', units: 'mm' },
      weight: 0.035,
      threadType: 'Metric Coarse',
      standard: 'DIN 315',
      finish: 'Zinc Plated',
      tensileStrength: '400 MPa'
    },
    manufacturer: 'MetalCraft Solutions',
    currentLocation: 'Warehouse, Chicago',
    currentOwner: 'MetalCraft Solutions',
    status: 'in-supply',
    quantity: 3000,
    price: 0.95,
    timeline: [
      {
        status: 'manufactured',
        title: 'Product Manufactured',
        date: new Date('2025-04-01T10:00:00Z'),
        location: 'MetalCraft Solutions, Chicago',
        handler: 'Production Team C',
        description: 'Manufacturing completed',
        notes: 'Awaiting quality check'
      },
      {
        status: 'quality-check',
        title: 'Quality Check',
        date: new Date('2025-04-02T10:00:00Z'),
        location: 'MetalCraft Solutions, Chicago',
        handler: 'QC Team',
        description: 'Quality verification completed',
        notes: 'Passed all tests'
      },
      {
        status: 'in-supply',
        title: 'In Supply Chain',
        date: new Date('2025-04-04T10:00:00Z'),
        location: 'Warehouse, Chicago',
        handler: 'SupplyChain Pro',
        description: 'Product in supply chain',
        notes: 'Ready for distribution'
      }
    ],
    transactions: []
  },
  {
    name: 'Lock Washer M12',
    trackingNumber: 'TRK-F-004',
    category: 'Fasteners',
    specifications: {
      material: 'Spring Steel',
      dimensions: { value: 'M12', units: 'mm' },
      weight: 0.008,
      standard: 'DIN 127B',
      finish: 'Plain',
      tensileStrength: '1100 MPa'
    },
    manufacturer: 'SpringTech Industries',
    currentLocation: 'Supply Center, Detroit',
    currentOwner: 'SpringTech Industries',
    status: 'quality-check',
    quantity: 10000,
    price: 0.15,
    timeline: [
      {
        status: 'manufactured',
        title: 'Product Manufactured',
        date: new Date('2025-04-01T10:00:00Z'),
        location: 'SpringTech Industries, Detroit',
        handler: 'Production Unit D',
        description: 'Batch production completed',
        notes: 'All specifications met'
      },
      {
        status: 'quality-check',
        title: 'Quality Check',
        date: new Date('2025-04-02T10:00:00Z'),
        location: 'SpringTech Industries, Detroit',
        handler: 'QC Department',
        description: 'Detailed quality inspection',
        notes: 'Performance testing in progress'
      }
    ],
    transactions: []
  },
  {
    name: 'Threaded Rod M16x1000',
    trackingNumber: 'TRK-F-005',
    category: 'Fasteners',
    specifications: {
      material: 'Stainless Steel 316',
      dimensions: { value: 'M16x1000', units: 'mm' },
      weight: 1.6,
      threadType: 'Metric Fine',
      standard: 'DIN 975',
      finish: 'Plain',
      tensileStrength: '600 MPa'
    },
    manufacturer: 'XYZ Manufacturing',
    currentLocation: 'Distribution Center, New York',
    currentOwner: 'XYZ Manufacturing',
    status: 'in-supply',
    quantity: 1000,
    price: 12.50,
    timeline: [
      {
        status: 'manufactured',
        title: 'Product Manufactured',
        date: new Date('2025-04-01T10:00:00Z'),
        location: 'XYZ Manufacturing, Ohio',
        handler: 'Production Line E',
        description: 'Manufacturing completed',
        notes: 'Awaiting quality check'
      },
      {
        status: 'quality-check',
        title: 'Quality Check',
        date: new Date('2025-04-02T10:00:00Z'),
        location: 'XYZ Manufacturing, Ohio',
        handler: 'QC Team',
        description: 'Quality verification completed',
        notes: 'Passed all tests'
      },
      {
        status: 'in-supply',
        title: 'In Supply Chain',
        date: new Date('2025-04-04T10:00:00Z'),
        location: 'Distribution Center, New York',
        handler: 'SupplyChain Pro',
        description: 'Product in supply chain',
        notes: 'Ready for distribution'
      }
    ],
    transactions: []
  },
  {
    name: 'Digital Caliper',
    trackingNumber: 'TRK-T-001',
    category: 'Tools',
    specifications: {
      material: 'Stainless Steel',
      dimensions: { value: '235x78x20', units: 'mm' },
      weight: 0.32,
      standard: 'DIN 862',
      accuracy: '±0.02mm',
      range: '0-150mm'
    },
    manufacturer: 'PrecisionTech Tools',
    currentLocation: 'Quality Lab, Detroit',
    currentOwner: 'PrecisionTech Tools',
    status: 'quality-check',
    quantity: 200,
    price: 89.99,
    timeline: [
      {
        status: 'manufactured',
        title: 'Product Manufactured',
        date: new Date('2025-04-01T10:00:00Z'),
        location: 'PrecisionTech Tools, Detroit',
        handler: 'Production Unit F',
        description: 'Batch production completed',
        notes: 'Initial testing passed'
      },
      {
        status: 'quality-check',
        title: 'Quality Check',
        date: new Date('2025-04-02T10:00:00Z'),
        location: 'Quality Lab, Detroit',
        handler: 'QC Department',
        description: 'Detailed quality inspection',
        notes: 'Performance testing in progress'
      }
    ],
    transactions: []
  },
  {
    name: 'Torque Wrench',
    trackingNumber: 'TRK-T-002',
    category: 'Tools',
    specifications: {
      material: 'Chrome Vanadium Steel',
      dimensions: { value: '450x50x25', units: 'mm' },
      weight: 1.2,
      range: '20-200Nm',
      accuracy: '±4%',
      calibration: 'ISO 6789'
    },
    manufacturer: 'TorqueMaster Pro',
    currentLocation: 'Tool Center, Chicago',
    currentOwner: 'TorqueMaster Pro',
    status: 'in-distribution',
    quantity: 150,
    price: 199.99,
    timeline: [
      {
        status: 'manufactured',
        title: 'Product Manufactured',
        date: new Date('2025-04-01T10:00:00Z'),
        location: 'TorqueMaster Pro, Chicago',
        handler: 'Production Line G',
        description: 'Manufacturing completed',
        notes: 'Awaiting quality check'
      },
      {
        status: 'quality-check',
        title: 'Quality Check',
        date: new Date('2025-04-02T10:00:00Z'),
        location: 'TorqueMaster Pro, Chicago',
        handler: 'QC Team',
        description: 'Quality verification completed',
        notes: 'Passed all tests'
      },
      {
        status: 'in-supply',
        title: 'In Supply Chain',
        date: new Date('2025-04-04T10:00:00Z'),
        location: 'Tool Center, Chicago',
        handler: 'SupplyChain Pro',
        description: 'Product in supply chain',
        notes: 'Ready for distribution'
      },
      {
        status: 'in-distribution',
        title: 'Distribution Started',
        date: new Date('2025-04-06T10:00:00Z'),
        location: 'Distribution Center, New York',
        handler: 'FastTrack Logistics',
        description: 'Product in distribution phase',
        notes: 'On schedule'
      }
    ],
    transactions: []
  },
  {
    name: 'Tap and Die Set',
    trackingNumber: 'TRK-T-003',
    category: 'Tools',
    specifications: {
      material: 'High Speed Steel',
      dimensions: { value: '300x200x50', units: 'mm' },
      weight: 2.5,
      pieces: 40,
      threadTypes: 'Metric & Imperial',
      finish: 'Black Oxide'
    },
    manufacturer: 'ThreadMaster Tools',
    currentLocation: 'Warehouse, Boston',
    currentOwner: 'ThreadMaster Tools',
    status: 'in-supply',
    quantity: 100,
    price: 149.99,
    timeline: [
      {
        status: 'manufactured',
        title: 'Product Manufactured',
        date: new Date('2025-04-01T10:00:00Z'),
        location: 'ThreadMaster Tools, Boston',
        handler: 'Production Unit H',
        description: 'Batch production completed',
        notes: 'Initial testing passed'
      },
      {
        status: 'quality-check',
        title: 'Quality Check',
        date: new Date('2025-04-02T10:00:00Z'),
        location: 'ThreadMaster Tools, Boston',
        handler: 'QC Department',
        description: 'Detailed quality inspection',
        notes: 'Performance testing in progress'
      },
      {
        status: 'in-supply',
        title: 'In Supply Chain',
        date: new Date('2025-04-04T10:00:00Z'),
        location: 'Warehouse, Boston',
        handler: 'SupplyChain Pro',
        description: 'Product in supply chain',
        notes: 'Ready for distribution'
      }
    ],
    transactions: []
  },
  {
    name: 'Digital Multimeter',
    trackingNumber: 'TRK-T-004',
    category: 'Tools',
    specifications: {
      material: 'ABS Plastic',
      dimensions: { value: '190x90x35', units: 'mm' },
      weight: 0.38,
      accuracy: '±0.5%',
      voltage: '1000V',
      current: '10A'
    },
    manufacturer: 'ElectroTech Pro',
    currentLocation: 'Service Center, Atlanta',
    currentOwner: 'ElectroTech Pro',
    status: 'manufactured',
    quantity: 300,
    price: 79.99,
    timeline: [
      {
        status: 'manufactured',
        title: 'Product Manufactured',
        date: new Date('2025-04-01T10:00:00Z'),
        location: 'ElectroTech Pro, Atlanta',
        handler: 'Production Line I',
        description: 'Manufacturing completed',
        notes: 'Awaiting quality check'
      }
    ],
    transactions: []
  },
  {
    name: 'Ball Bearing 6205',
    trackingNumber: 'TRK-C-001',
    category: 'Components',
    specifications: {
      material: 'Chrome Steel',
      dimensions: { value: '52x25x15', units: 'mm' },
      weight: 0.13,
      type: 'Deep Groove',
      loadRating: '14.8kN',
      speed: '13000 RPM'
    },
    manufacturer: 'BearingTech Industries',
    currentLocation: 'Distribution Hub, Cleveland',
    currentOwner: 'BearingTech Industries',
    status: 'in-distribution',
    quantity: 1000,
    price: 8.99,
    timeline: [
      {
        status: 'manufactured',
        title: 'Product Manufactured',
        date: new Date('2025-04-01T10:00:00Z'),
        location: 'BearingTech Industries, Cleveland',
        handler: 'Production Unit J',
        description: 'Batch production completed',
        notes: 'Initial testing passed'
      },
      {
        status: 'quality-check',
        title: 'Quality Check',
        date: new Date('2025-04-02T10:00:00Z'),
        location: 'BearingTech Industries, Cleveland',
        handler: 'QC Department',
        description: 'Detailed quality inspection',
        notes: 'Performance testing in progress'
      },
      {
        status: 'in-supply',
        title: 'In Supply Chain',
        date: new Date('2025-04-04T10:00:00Z'),
        location: 'Distribution Hub, Cleveland',
        handler: 'SupplyChain Pro',
        description: 'Product in supply chain',
        notes: 'Ready for distribution'
      },
      {
        status: 'in-distribution',
        title: 'Distribution Started',
        date: new Date('2025-04-06T10:00:00Z'),
        location: 'Distribution Center, New York',
        handler: 'FastTrack Logistics',
        description: 'Product in distribution phase',
        notes: 'On schedule'
      }
    ],
    transactions: []
  },
  {
    name: 'Timing Belt HTD-5M',
    trackingNumber: 'TRK-C-002',
    category: 'Components',
    specifications: {
      material: 'Neoprene with Fiberglass',
      dimensions: { value: '600x15x5', units: 'mm' },
      weight: 0.15,
      pitch: '5mm',
      teeth: 120,
      width: '15mm'
    },
    manufacturer: 'PowerDrive Systems',
    currentLocation: 'Warehouse, Phoenix',
    currentOwner: 'PowerDrive Systems',
    status: 'in-supply',
    quantity: 500,
    price: 24.99,
    timeline: [
      {
        status: 'manufactured',
        title: 'Product Manufactured',
        date: new Date('2025-04-01T10:00:00Z'),
        location: 'PowerDrive Systems, Phoenix',
        handler: 'Production Unit K',
        description: 'Manufacturing completed',
        notes: 'Awaiting quality check'
      },
      {
        status: 'quality-check',
        title: 'Quality Check',
        date: new Date('2025-04-02T10:00:00Z'),
        location: 'PowerDrive Systems, Phoenix',
        handler: 'QC Team',
        description: 'Quality verification completed',
        notes: 'Passed all tests'
      },
      {
        status: 'in-supply',
        title: 'In Supply Chain',
        date: new Date('2025-04-04T10:00:00Z'),
        location: 'Warehouse, Phoenix',
        handler: 'SupplyChain Pro',
        description: 'Product in supply chain',
        notes: 'Ready for distribution'
      }
    ],
    transactions: []
  },
  {
    name: 'Linear Guide Rail',
    trackingNumber: 'TRK-C-003',
    category: 'Components',
    specifications: {
      material: 'Hardened Steel',
      dimensions: { value: '1000x23x22', units: 'mm' },
      weight: 2.8,
      type: 'Square Rail',
      loadCapacity: '2800N',
      accuracy: 'H Class'
    },
    manufacturer: 'LinearTech Solutions',
    currentLocation: 'Manufacturing Plant, Detroit',
    currentOwner: 'LinearTech Solutions',
    status: 'manufactured',
    quantity: 100,
    price: 89.99,
    timeline: [
      {
        status: 'manufactured',
        title: 'Product Manufactured',
        date: new Date('2025-04-01T10:00:00Z'),
        location: 'LinearTech Solutions, Detroit',
        handler: 'Production Unit L',
        description: 'Batch production completed',
        notes: 'Initial testing passed'
      }
    ],
    transactions: []
  },
  {
    name: 'Heavy Duty Hinge',
    trackingNumber: 'TRK-H-001',
    category: 'Hardware',
    specifications: {
      material: 'Stainless Steel 316',
      dimensions: { value: '100x75x3', units: 'mm' },
      weight: 0.25,
      loadCapacity: '80kg',
      finish: 'Brushed',
      screwSize: 'M6'
    },
    manufacturer: 'MetalCraft Solutions',
    currentLocation: 'Supply Center, Atlanta',
    currentOwner: 'Southern Distributors',
    status: 'in-supply',
    quantity: 800,
    price: 18.99,
    timeline: [
      {
        status: 'manufactured',
        title: 'Product Manufactured',
        date: new Date('2025-04-01T10:00:00Z'),
        location: 'MetalCraft Solutions, Atlanta',
        handler: 'Production Unit M',
        description: 'Manufacturing completed',
        notes: 'Awaiting quality check'
      },
      {
        status: 'quality-check',
        title: 'Quality Check',
        date: new Date('2025-04-02T10:00:00Z'),
        location: 'MetalCraft Solutions, Atlanta',
        handler: 'QC Team',
        description: 'Quality verification completed',
        notes: 'Passed all tests'
      },
      {
        status: 'in-supply',
        title: 'In Supply Chain',
        date: new Date('2025-04-04T10:00:00Z'),
        location: 'Supply Center, Atlanta',
        handler: 'SupplyChain Pro',
        description: 'Product in supply chain',
        notes: 'Ready for distribution'
      }
    ],
    transactions: []
  },
  {
    name: 'Cabinet Lock',
    trackingNumber: 'TRK-H-002',
    category: 'Hardware',
    specifications: {
      material: 'Zinc Alloy',
      dimensions: { value: '30x25x20', units: 'mm' },
      weight: 0.08,
      type: 'Cam Lock',
      finish: 'Chrome Plated',
      keyType: 'Tubular'
    },
    manufacturer: 'SecureTech Hardware',
    currentLocation: 'Distribution Center, Dallas',
    currentOwner: 'SecureTech Hardware',
    status: 'quality-check',
    quantity: 2000,
    price: 5.99,
    timeline: [
      {
        status: 'manufactured',
        title: 'Product Manufactured',
        date: new Date('2025-04-01T10:00:00Z'),
        location: 'SecureTech Hardware, Dallas',
        handler: 'Production Unit N',
        description: 'Batch production completed',
        notes: 'Initial testing passed'
      },
      {
        status: 'quality-check',
        title: 'Quality Check',
        date: new Date('2025-04-02T10:00:00Z'),
        location: 'SecureTech Hardware, Dallas',
        handler: 'QC Department',
        description: 'Detailed quality inspection',
        notes: 'Performance testing in progress'
      }
    ],
    transactions: []
  },
  {
    name: 'Drawer Slide',
    trackingNumber: 'TRK-H-003',
    category: 'Hardware',
    specifications: {
      material: 'Cold Rolled Steel',
      dimensions: { value: '450x45x12', units: 'mm' },
      weight: 0.9,
      type: 'Ball Bearing',
      loadCapacity: '45kg',
      extension: 'Full'
    },
    manufacturer: 'SlideTech Pro',
    currentLocation: 'Warehouse, Seattle',
    currentOwner: 'SlideTech Pro',
    status: 'in-distribution',
    quantity: 400,
    price: 14.99,
    timeline: [
      {
        status: 'manufactured',
        title: 'Product Manufactured',
        date: new Date('2025-04-01T10:00:00Z'),
        location: 'SlideTech Pro, Seattle',
        handler: 'Production Unit O',
        description: 'Manufacturing completed',
        notes: 'Awaiting quality check'
      },
      {
        status: 'quality-check',
        title: 'Quality Check',
        date: new Date('2025-04-02T10:00:00Z'),
        location: 'SlideTech Pro, Seattle',
        handler: 'QC Team',
        description: 'Quality verification completed',
        notes: 'Passed all tests'
      },
      {
        status: 'in-supply',
        title: 'In Supply Chain',
        date: new Date('2025-04-04T10:00:00Z'),
        location: 'Warehouse, Seattle',
        handler: 'SupplyChain Pro',
        description: 'Product in supply chain',
        notes: 'Ready for distribution'
      },
      {
        status: 'in-distribution',
        title: 'Distribution Started',
        date: new Date('2025-04-06T10:00:00Z'),
        location: 'Distribution Center, New York',
        handler: 'FastTrack Logistics',
        description: 'Product in distribution phase',
        notes: 'On schedule'
      }
    ],
    transactions: []
  }
];

// Add transactions to each product
mockProducts.forEach(product => {
  product.transactions = generateTransactions(product);
});

module.exports = mockProducts;
