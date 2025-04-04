const mockUsers = [
  {
    username: 'supplier1',
    email: 'supplier1@example.com',
    role: 'supplier',
    verificationStatus: 'verified',
    profile: {
      firstName: 'John',
      lastName: 'Doe',
      phone: '+1234567890',
      avatar: 'https://randomuser.me/api/portraits/men/1.jpg'
    },
    company: {
      name: 'ABC Supplies',
      address: {
        street: '123 Supply St',
        city: 'Chicago',
        state: 'IL',
        country: 'USA',
        postalCode: '60601'
      }
    },
    createdAt: '2025-03-01T10:00:00Z'
  },
  {
    username: 'manufacturer1',
    email: 'manufacturer1@example.com',
    role: 'manufacturer',
    verificationStatus: 'verified',
    profile: {
      firstName: 'Jane',
      lastName: 'Smith',
      phone: '+1234567891',
      avatar: 'https://randomuser.me/api/portraits/women/1.jpg'
    },
    company: {
      name: 'XYZ Manufacturing',
      address: {
        street: '456 Factory Ave',
        city: 'Detroit',
        state: 'MI',
        country: 'USA',
        postalCode: '48201'
      }
    },
    createdAt: '2025-03-02T11:00:00Z'
  },
  {
    username: 'distributor1',
    email: 'distributor1@example.com',
    role: 'distributor',
    verificationStatus: 'verified',
    profile: {
      firstName: 'Robert',
      lastName: 'Johnson',
      phone: '+1234567892',
      avatar: 'https://randomuser.me/api/portraits/men/2.jpg'
    },
    company: {
      name: 'Global Distribution Co.',
      address: {
        street: '789 Logistics Blvd',
        city: 'Atlanta',
        state: 'GA',
        country: 'USA',
        postalCode: '30301'
      }
    },
    createdAt: '2025-03-03T09:30:00Z'
  },
  {
    username: 'customer1',
    email: 'customer1@example.com',
    role: 'customer',
    verificationStatus: 'verified',
    profile: {
      firstName: 'Emily',
      lastName: 'Davis',
      phone: '+1234567893',
      avatar: 'https://randomuser.me/api/portraits/women/2.jpg'
    },
    company: {
      name: 'Davis Construction',
      address: {
        street: '101 Builder St',
        city: 'Denver',
        state: 'CO',
        country: 'USA',
        postalCode: '80201'
      }
    },
    createdAt: '2025-03-04T14:45:00Z'
  },
  {
    username: 'admin1',
    email: 'admin1@nurachain.com',
    role: 'admin',
    verificationStatus: 'verified',
    profile: {
      firstName: 'Admin',
      lastName: 'User',
      phone: '+1234567894',
      avatar: 'https://randomuser.me/api/portraits/men/3.jpg'
    },
    company: {
      name: 'NuraChain',
      address: {
        street: '1 Admin Plaza',
        city: 'San Francisco',
        state: 'CA',
        country: 'USA',
        postalCode: '94105'
      }
    },
    createdAt: '2025-03-05T08:15:00Z'
  }
];

module.exports = mockUsers;
