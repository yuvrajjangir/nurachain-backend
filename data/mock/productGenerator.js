// Product Generator for NuraChain
const generateProducts = (count = 40) => {
  const products = [];
  
  // Product categories and their properties
  const categories = {
    'Fasteners': {
      names: [
        'Hex Head Bolt', 'Socket Head Cap Screw', 'Hex Nut', 'Lock Nut', 
        'Washer', 'Self-Tapping Screw', 'Carriage Bolt', 'Eye Bolt',
        'Anchor Bolt', 'Set Screw', 'Machine Screw', 'Wood Screw'
      ],
      specs: {
        materials: ['Stainless Steel 304', 'Stainless Steel 316', 'Carbon Steel', 'Alloy Steel', 'Brass', 'Titanium'],
        sizes: ['M4', 'M5', 'M6', 'M8', 'M10', 'M12', 'M16', 'M20'],
        lengths: ['10mm', '15mm', '20mm', '25mm', '30mm', '40mm', '50mm', '60mm', '75mm', '100mm'],
        finishes: ['Zinc Plated', 'Black Oxide', 'Plain', 'Galvanized', 'Chrome Plated', 'Hot-Dip Galvanized'],
        standards: ['ISO 4014', 'ISO 4017', 'DIN 931', 'DIN 933', 'ASTM A307', 'ASTM F593']
      }
    },
    'Tools': {
      names: [
        'Adjustable Wrench', 'Socket Set', 'Screwdriver Set', 'Digital Caliper',
        'Torque Wrench', 'Hex Key Set', 'Hammer', 'Pliers',
        'Measuring Tape', 'Level', 'Drill Bit Set', 'Tap and Die Set'
      ],
      specs: {
        materials: ['Chrome Vanadium Steel', 'Tool Steel', 'Carbon Steel', 'Aluminum', 'Plastic Composite', 'Titanium Coated'],
        sizes: ['6-inch', '8-inch', '10-inch', '12-inch', '18-inch', '24-inch', 'Metric', 'SAE'],
        features: ['Ergonomic Handle', 'Anti-Slip Grip', 'Magnetic Tip', 'Quick Release', 'Ratcheting', 'Cushioned Grip'],
        standards: ['ANSI', 'ISO', 'DIN', 'JIS', 'ASME']
      }
    },
    'Components': {
      names: [
        'Ball Bearing', 'Roller Bearing', 'Gear', 'Sprocket', 'Pulley',
        'Shaft Collar', 'Linear Bearing', 'Bushing', 'Coupling',
        'Chain Link', 'Gasket', 'O-Ring'
      ],
      specs: {
        materials: ['Chrome Steel', 'Stainless Steel', 'Nylon', 'Brass', 'Bronze', 'Cast Iron', 'Aluminum'],
        types: ['Deep Groove', 'Angular Contact', 'Thrust', 'Needle', 'Tapered', 'Self-Aligning'],
        sizes: ['608', '6200', '6201', '6202', '6203', '6204', '6205', '6206', '6305', '6306'],
        standards: ['ISO 15', 'ABEC-1', 'ABEC-3', 'ABEC-5', 'ABEC-7', 'ABEC-9']
      }
    },
    'Hardware': {
      names: [
        'Door Hinge', 'Cabinet Handle', 'Drawer Slide', 'Lock Set',
        'Corner Bracket', 'Shelf Support', 'Caster Wheel', 'Door Closer',
        'Gate Latch', 'Furniture Leg', 'Cable Grommet', 'Furniture Connector'
      ],
      specs: {
        materials: ['Stainless Steel 304', 'Stainless Steel 316', 'Brass', 'Zinc Alloy', 'Aluminum', 'Cast Iron'],
        finishes: ['Brushed Nickel', 'Oil-Rubbed Bronze', 'Polished Chrome', 'Antique Brass', 'Matte Black', 'Satin Nickel'],
        sizes: ['2-inch', '3-inch', '4-inch', '5-inch', '6-inch', '8-inch', '10-inch', '12-inch'],
        loadRatings: ['Light Duty', 'Medium Duty', 'Heavy Duty', 'Extra Heavy Duty']
      }
    }
  };
  
  // Locations
  const locations = {
    manufacturing: [
      'Manufacturing Plant, Detroit, MI', 
      'Manufacturing Plant, Pittsburgh, PA',
      'Manufacturing Plant, Chicago, IL',
      'Manufacturing Plant, Boston, MA',
      'Manufacturing Plant, Seattle, WA',
      'Manufacturing Plant, Houston, TX',
      'Manufacturing Plant, Cleveland, OH',
      'Manufacturing Plant, Charlotte, NC'
    ],
    qc: [
      'QC Department, Detroit, MI',
      'QC Department, Pittsburgh, PA',
      'QC Department, Chicago, IL',
      'QC Department, Boston, MA',
      'QC Department, Seattle, WA',
      'QC Department, Houston, TX',
      'QC Department, Cleveland, OH',
      'QC Department, Charlotte, NC'
    ],
    warehouses: [
      'Warehouse, Chicago, IL',
      'Warehouse, Atlanta, GA',
      'Warehouse, Dallas, TX',
      'Warehouse, Denver, CO',
      'Warehouse, Los Angeles, CA',
      'Warehouse, New York, NY',
      'Warehouse, Miami, FL',
      'Warehouse, Seattle, WA'
    ],
    distribution: [
      'Distribution Center, New York, NY',
      'Distribution Center, Atlanta, GA',
      'Distribution Center, Chicago, IL',
      'Distribution Center, Dallas, TX',
      'Distribution Center, Los Angeles, CA',
      'Distribution Center, Seattle, WA',
      'Distribution Center, Nashville, TN',
      'Distribution Center, Phoenix, AZ'
    ]
  };
  
  // Companies
  const companies = {
    manufacturers: [
      'XYZ Manufacturing', 
      'Anderson Manufacturing', 
      'Miller Manufacturing',
      'Taylor Supplies',
      'Johnson Industrial',
      'Precision Components',
      'Elite Manufacturing',
      'Global Industrial'
    ],
    suppliers: [
      'ABC Supplies',
      'Smith Supply Co.',
      'Industrial Parts Inc.',
      'Quality Components',
      'National Supply Chain',
      'Premier Supply',
      'United Components',
      'Reliable Parts'
    ],
    distributors: [
      'FastTrack Logistics',
      'Global Distribution Co.',
      'Wilson Logistics',
      'Rapid Shipping',
      'Express Delivery',
      'Metro Distribution',
      'Continental Logistics',
      'Prime Delivery'
    ],
    customers: [
      'Acme Hardware',
      'Davis Construction',
      'Martinez Builders',
      'Thompson Manufacturing',
      'Wilson Engineering',
      'Parker Industries',
      'Central Maintenance',
      'Precision Builders'
    ]
  };
  
  // Product statuses
  const statuses = ['manufactured', 'quality-check', 'in-supply', 'in-distribution'];
  
  // Helper function to get random element from array
  const getRandomElement = (array) => array[Math.floor(Math.random() * array.length)];
  
  // Helper function to get random number between min and max
  const getRandomNumber = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
  
  // Helper function to generate a date in the past few months
  const getRandomDate = (daysBack = 120) => {
    const date = new Date();
    date.setDate(date.getDate() - Math.floor(Math.random() * daysBack));
    return date.toISOString();
  };
  
  // Helper function to generate a date after a given date
  const getDateAfter = (startDate, daysAfter = 3) => {
    const date = new Date(startDate);
    date.setDate(date.getDate() + Math.floor(Math.random() * daysAfter) + 1);
    return date.toISOString();
  };
  
  // Generate products
  for (let i = 1; i <= count; i++) {
    // Select random category
    const categoryName = Object.keys(categories)[Math.floor(Math.random() * Object.keys(categories).length)];
    const category = categories[categoryName];
    
    // Select random product name
    const productName = getRandomElement(category.names);
    
    // Select random status
    const status = getRandomElement(statuses);
    
    // Generate specifications based on category
    let specifications = {};
    if (categoryName === 'Fasteners') {
      const material = getRandomElement(category.specs.materials);
      const size = getRandomElement(category.specs.sizes);
      const length = getRandomElement(category.specs.lengths);
      specifications = {
        material,
        dimensions: `${size}x${length}`,
        weight: parseFloat((Math.random() * 0.1 + 0.01).toFixed(3)),
        threadType: Math.random() > 0.5 ? 'Coarse' : 'Fine',
        standard: getRandomElement(category.specs.standards),
        finish: getRandomElement(category.specs.finishes),
        tensileStrength: `${getRandomNumber(600, 1200)} MPa`
      };
    } else if (categoryName === 'Tools') {
      const size = getRandomElement(category.specs.sizes);
      specifications = {
        material: getRandomElement(category.specs.materials),
        dimensions: size,
        weight: parseFloat((Math.random() * 1 + 0.2).toFixed(2)),
        standard: getRandomElement(category.specs.standards),
        feature: getRandomElement(category.specs.features)
      };
    } else if (categoryName === 'Components') {
      const size = getRandomElement(category.specs.sizes);
      specifications = {
        material: getRandomElement(category.specs.materials),
        dimensions: size,
        weight: parseFloat((Math.random() * 0.5 + 0.05).toFixed(2)),
        type: getRandomElement(category.specs.types),
        standard: getRandomElement(category.specs.standards)
      };
    } else if (categoryName === 'Hardware') {
      const size = getRandomElement(category.specs.sizes);
      specifications = {
        material: getRandomElement(category.specs.materials),
        dimensions: size,
        weight: parseFloat((Math.random() * 0.8 + 0.1).toFixed(2)),
        finish: getRandomElement(category.specs.finishes),
        loadRating: getRandomElement(category.specs.loadRatings)
      };
    }
    
    // Generate manufacturer
    const manufacturer = getRandomElement(companies.manufacturers);
    
    // Generate random quantity and price
    const quantity = getRandomNumber(500, 10000);
    const price = parseFloat((Math.random() * 50 + 0.5).toFixed(2));
    
    // Generate timeline based on status
    const timeline = [];
    const createdDate = getRandomDate();
    
    // Manufacturing step
    timeline.push({
      status: 'manufactured',
      title: 'Manufacturing Completed',
      date: createdDate,
      location: getRandomElement(locations.manufacturing),
      handler: manufacturer,
      description: 'Production completed according to specifications',
      notes: `Batch #${productName.substring(0, 2).toUpperCase()}-${new Date(createdDate).getFullYear()}-${new Date(createdDate).getMonth() + 1}-${getRandomNumber(1, 999).toString().padStart(3, '0')} produced and ready for quality check`
    });
    
    // Add additional timeline steps based on status
    if (status === 'quality-check' || status === 'in-supply' || status === 'in-distribution') {
      const qcDate = getDateAfter(createdDate);
      timeline.push({
        status: 'quality-check',
        title: 'Quality Control Passed',
        date: qcDate,
        location: getRandomElement(locations.qc),
        handler: 'QC Team',
        description: 'All quality standards verified and passed',
        notes: `${categoryName === 'Fasteners' ? 'Tensile strength and dimensional' : categoryName === 'Tools' ? 'Durability and accuracy' : categoryName === 'Components' ? 'Performance and dimensional' : 'Structural and functional'} tests completed successfully`
      });
    }
    
    // Supplier step
    let currentOwner = manufacturer;
    let currentLocation = timeline[timeline.length - 1].location;
    
    if (status === 'in-supply' || status === 'in-distribution') {
      const supplier = getRandomElement(companies.suppliers);
      currentOwner = supplier;
      currentLocation = getRandomElement(locations.warehouses);
      const supplyDate = getDateAfter(timeline[timeline.length - 1].date);
      
      timeline.push({
        status: 'in-supply',
        title: 'Received by Supplier',
        date: supplyDate,
        location: currentLocation,
        handler: supplier,
        description: 'Product received and inventoried',
        notes: `Stored in Warehouse Section ${String.fromCharCode(65 + Math.floor(Math.random() * 8))}, Rack ${getRandomNumber(1, 20)}`
      });
    }
    
    // Distribution step
    if (status === 'in-distribution') {
      const distributor = getRandomElement(companies.distributors);
      currentOwner = distributor;
      currentLocation = getRandomElement(locations.distribution);
      const distributionDate = getDateAfter(timeline[timeline.length - 1].date);
      
      timeline.push({
        status: 'in-distribution',
        title: 'In Transit to Customer',
        date: distributionDate,
        location: currentLocation,
        handler: distributor,
        description: 'Product in transit to final destination',
        notes: `Estimated delivery: ${new Date(new Date(distributionDate).getTime() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`
      });
    }
    
    // Generate transactions
    const transactions = [];
    
    // Add transactions based on timeline
    if (timeline.length >= 3) { // At least in-supply status
      transactions.push({
        id: `tx-p${i}-001`,
        date: timeline[2].date,
        from: manufacturer,
        to: timeline[2].handler,
        quantity,
        status: 'Completed'
      });
    }
    
    if (timeline.length >= 4) { // At in-distribution status
      transactions.push({
        id: `tx-p${i}-002`,
        date: timeline[3].date,
        from: timeline[2].handler,
        to: timeline[3].handler,
        quantity,
        status: 'Completed'
      });
      
      // Add a pending transaction to a customer
      const pendingDate = getDateAfter(timeline[3].date);
      transactions.push({
        id: `tx-p${i}-003`,
        date: pendingDate,
        from: timeline[3].handler,
        to: getRandomElement(companies.customers),
        quantity: Math.floor(quantity / 2),
        status: 'Pending'
      });
    }
    
    // Create the product object
    const product = {
      id: `p${i}`,
      name: `${productName} ${specifications.dimensions}`,
      category: categoryName,
      trackingNumber: `TRK-${categoryName.charAt(0)}-${i.toString().padStart(3, '0')}`,
      specifications,
      manufacturer,
      currentLocation,
      currentOwner,
      status,
      quantity,
      price,
      timeline,
      transactions,
      createdAt: createdDate,
      updatedAt: timeline[timeline.length - 1].date
    };
    
    products.push(product);
  }
  
  return products;
};

module.exports = generateProducts;
