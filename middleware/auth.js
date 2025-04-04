const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  try {
    let token;

    // Get token from header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Get user from token
      const user = await User.findById(decoded.id).select('-password');
      
      if (!user) {
        return res.status(401).json({ message: 'User not found' });
      }

      req.user = user;
      next();
    } catch (error) {
      // If token is expired, try to use refresh token
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ 
          message: 'Token expired',
          code: 'TOKEN_EXPIRED'
        });
      }
      
      return res.status(401).json({ message: 'Not authorized' });
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ message: 'Error authenticating user' });
  }
};

const restrictTo = (...roles) => {
  return (req, res, next) => {
    console.log('User role:', req.user.role); // Debug log
    console.log('Allowed roles:', roles); // Debug log
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: `Not authorized. Required roles: ${roles.join(', ')}. Your role: ${req.user.role}`
      });
    }
    next();
  };
};

module.exports = { protect, restrictTo };
