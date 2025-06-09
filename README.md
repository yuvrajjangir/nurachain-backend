# NuraChain Backend

This is the backend service for the NuraChain supply chain management system. It provides APIs for product tracking, user management, and transaction processing.

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

## Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd nurachain-backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory with the following variables:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/nurachain
JWT_SECRET=your_jwt_secret_key
NODE_ENV=development
```

4. Start the development server:
```bash
npm run dev
```

5. Seed the database with initial data:
```bash
npm run seed
```

## API Endpoints

### Authentication
- POST `/api/auth/register` - Register a new user
- POST `/api/auth/login` - Login user
- GET `/api/auth/me` - Get current user profile

### Products
- GET `/api/products` - Get all products
- GET `/api/products/:trackingNumber` - Get product by tracking number
- POST `/api/products` - Create new product
- PUT `/api/products/:id` - Update product
- DELETE `/api/products/:id` - Delete product

### Transactions
- GET `/api/transactions` - Get all transactions
- GET `/api/transactions/:id` - Get transaction by ID
- POST `/api/transactions` - Create new transaction
- PUT `/api/transactions/:id` - Update transaction status

### Users
- GET `/api/users` - Get all users (admin only)
- GET `/api/users/:id` - Get user by ID
- PUT `/api/users/:id` - Update user profile
- DELETE `/api/users/:id` - Delete user (admin only)

## Database Schema

### User
- username (String)
- email (String)
- password (String, hashed)
- role (String: admin, supplier, distributor, customer)
- verificationStatus (String)
- profile (Object)
- company (Object, for suppliers/distributors)

### Product
- name (String)
- category (String)
- subCategory (String)
- specifications (Object)
- manufacturer (ObjectId, ref: User)
- currentOwner (ObjectId, ref: User)
- currentLocation (String)
- status (String)
- quantity (Number)
- price (Number)
- timeline (Array)

### Transaction
- transactionId (String)
- product (ObjectId, ref: Product)
- productTrackingNumber (String)
- fromUser (ObjectId, ref: User)
- toUser (ObjectId, ref: User)
- quantity (Number)
- status (String)
- shipmentDetails (Object)
- timeline (Array)
- totalAmount (Number)

## Development

The project uses:
- Express.js for the web server
- MongoDB with Mongoose for the database
- JWT for authentication
- bcrypt for password hashing

## Testing

To run tests:
```bash
npm test
```

## Deployment

1. Set NODE_ENV to production in .env
2. Build the application:
```bash
npm run build
```
3. Start the production server:
```bash
npm start
```

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License. 