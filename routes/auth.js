const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { protect, restrictTo } = require('../middleware/auth');
const router = express.Router();

// Helper function to generate tokens
const generateTokens = (userId) => {
  const token = jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: '1h'
  });
  
  const refreshToken = jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: '7d'
  });
  
  return { token, refreshToken };
};

// Get all users (admin only)
router.get('/users', protect, restrictTo('admin'), async (req, res) => {
  try {
    const users = await User.find({}).select('-password');
    res.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Error getting users' });
  }
});

// Get pending verifications (admin only)
router.get('/pending-verifications', protect, restrictTo('admin'), async (req, res) => {
  try {
    const pendingUsers = await User.find({ 
      verificationStatus: 'pending',
      role: { $in: ['manufacturer', 'supplier', 'distributor', 'quality-inspector'] }
    }).select('-password');
    res.json(pendingUsers);
  } catch (error) {
    console.error('Get pending verifications error:', error);
    res.status(500).json({ message: 'Error getting pending verifications' });
  }
});

// Verify or reject user (admin only)
router.patch('/verify/:userId', protect, restrictTo('admin'), async (req, res) => {
  try {
    const { action, notes } = req.body;
    if (!['verify', 'reject'].includes(action)) {
      return res.status(400).json({ message: 'Invalid action' });
    }

    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.verificationStatus = action === 'verify' ? 'verified' : 'rejected';
    user.verificationNotes = notes;
    user.verifiedBy = req.user._id;
    user.verifiedAt = Date.now();

    await user.save();

    res.json({
      message: `User ${action === 'verify' ? 'verified' : 'rejected'} successfully`,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        verificationStatus: user.verificationStatus,
        profile: user.profile,
        company: user.company,
        specializations: user.specializations,
        certifications: user.certifications,
        yearsOfExperience: user.yearsOfExperience
      }
    });
  } catch (error) {
    console.error('Verify user error:', error);
    res.status(500).json({ message: 'Error verifying user' });
  }
});

// Check if admin exists
router.get('/check-admin', async (req, res) => {
  try {
    const adminExists = await User.exists({ role: 'admin' });
    res.json({ adminExists: !!adminExists });
  } catch (error) {
    console.error('Check admin error:', error);
    res.status(500).json({ message: 'Error checking admin' });
  }
});

// Create first admin (only works if no admin exists)
router.post('/create-first-admin', async (req, res) => {
  try {
    // Check if any admin exists
    const adminExists = await User.findOne({ role: 'admin' });
    if (adminExists) {
      return res.status(403).json({ 
        message: 'Admin already exists. Additional admins must be created by existing admin.' 
      });
    }

    const { username, email, password } = req.body;
    const admin = await User.create({
      username,
      email,
      password,
      role: 'admin',
      verificationStatus: 'verified',
      profile: {
        firstName: req.body.firstName || '',
        lastName: req.body.lastName || '',
        phone: req.body.phone || ''
      }
    });

    const { token, refreshToken } = generateTokens(admin._id);

    res.status(201).json({
      user: {
        id: admin._id,
        username: admin.username,
        email: admin.email,
        role: admin.role,
        verificationStatus: admin.verificationStatus,
        profile: admin.profile
      },
      token,
      refreshToken
    });
  } catch (error) {
    console.error('Create first admin error:', error);
    res.status(500).json({ message: 'Error creating first admin' });
  }
});

// Admin creates another admin
router.post('/create-admin', protect, restrictTo('admin'), async (req, res) => {
  try {
    const { username, email, password, firstName, lastName, phone } = req.body;
    const admin = await User.create({
      username,
      email,
      password,
      role: 'admin',
      verificationStatus: 'verified',
      profile: {
        firstName: firstName || '',
        lastName: lastName || '',
        phone: phone || ''
      }
    });

    res.status(201).json({
      user: {
        id: admin._id,
        username: admin.username,
        email: admin.email,
        role: admin.role,
        verificationStatus: admin.verificationStatus,
        profile: admin.profile
      }
    });
  } catch (error) {
    console.error('Create admin error:', error);
    res.status(500).json({ message: 'Error creating admin' });
  }
});

// Register new user
router.post('/register', async (req, res) => {
  try {
    const {
      username,
      email,
      password,
      role,
      firstName,
      lastName,
      phone,
      companyName,
      companyAddress,
      specializations,
      certifications,
      yearsOfExperience
    } = req.body;

    // Check if user exists
    let user = await User.findOne({ $or: [{ email }, { username }] });
    if (user) {
      return res.status(400).json({
        message: 'User already exists with this email or username'
      });
    }

    // Create user
    user = new User({
      username,
      email,
      password,
      role,
      company: {
        name: companyName || '',
        address: companyAddress || {}
      },
      verificationStatus: role === 'admin' ? 'verified' : 'pending'
    });

    // Add quality inspector specific fields
    if (role === 'quality-inspector') {
      user.specializations = specializations;
      user.certifications = certifications;
      user.yearsOfExperience = yearsOfExperience;
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    // Save user
    await user.save();

    // Create token
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.status(201).json({
      message: 'Registration successful! Please wait for admin approval.',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        company: user.company,
        verificationStatus: user.verificationStatus,
        specializations: user.specializations,
        certifications: user.certifications,
        yearsOfExperience: user.yearsOfExperience
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      message: 'Server error during registration',
      error: error.message
    });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check verification status
    if (user.verificationStatus === 'pending') {
      return res.status(403).json({ 
        message: 'Your account is pending approval',
        verificationStatus: 'pending'
      });
    }

    if (user.verificationStatus === 'rejected') {
      return res.status(403).json({ 
        message: 'Your account has been rejected',
        verificationStatus: 'rejected'
      });
    }

    // Generate tokens
    const { token, refreshToken } = generateTokens(user._id);

    res.json({
      token,
      refreshToken,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        company: user.company,
        profile: user.profile,
        verificationStatus: user.verificationStatus,
        specializations: user.specializations,
        certifications: user.certifications,
        yearsOfExperience: user.yearsOfExperience,
        permissions: user.permissions
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// Get current user
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        company: user.company,
        profile: user.profile,
        verificationStatus: user.verificationStatus,
        specializations: user.specializations,
        certifications: user.certifications,
        yearsOfExperience: user.yearsOfExperience,
        permissions: user.permissions
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error getting user data' });
  }
});

// Refresh token
router.post('/refresh-token', async (req, res) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return res.status(401).json({ message: 'No refresh token provided' });
    }

    try {
      // Verify the refresh token
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
      
      // Generate new tokens
      const { token: newToken, refreshToken: newRefreshToken } = generateTokens(decoded.id);
      
      // Get user data to return with new tokens
      const user = await User.findById(decoded.id).select('-password');
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      res.json({ 
        token: newToken, 
        refreshToken: newRefreshToken,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
          company: user.company,
          profile: user.profile,
          verificationStatus: user.verificationStatus,
          specializations: user.specializations,
          certifications: user.certifications,
          yearsOfExperience: user.yearsOfExperience,
          permissions: user.permissions
        }
      });
    } catch (error) {
      return res.status(401).json({ message: 'Invalid refresh token' });
    }
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(500).json({ message: 'Error refreshing token' });
  }
});

// Update user profile
router.patch('/profile', protect, async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      phone,
      companyName,
      companyAddress,
      specializations,
      certifications,
      yearsOfExperience
    } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update profile
    if (firstName) user.profile.firstName = firstName;
    if (lastName) user.profile.lastName = lastName;
    if (phone) user.profile.phone = phone;

    // Update company info
    if (companyName) user.company.name = companyName;
    if (companyAddress) {
      user.company.address = {
        street: companyAddress.street || user.company.address.street,
        city: companyAddress.city || user.company.address.city,
        state: companyAddress.state || user.company.address.state,
        country: companyAddress.country || user.company.address.country,
        postalCode: companyAddress.postalCode || user.company.address.postalCode
      };
    }

    // Update quality inspector specific fields
    if (user.role === 'quality-inspector') {
      if (specializations) user.specializations = specializations;
      if (certifications) user.certifications = certifications;
      if (yearsOfExperience) user.yearsOfExperience = yearsOfExperience;
    }

    await user.save();

    res.status(200).json({
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        verificationStatus: user.verificationStatus,
        profile: user.profile,
        company: user.company,
        specializations: user.specializations,
        certifications: user.certifications,
        yearsOfExperience: user.yearsOfExperience
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Error updating profile' });
  }
});

module.exports = router;
