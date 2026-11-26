const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

// Generate JWT Helper
const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET || 'supersecret_jwt_key_govt_order_platform_2026_secure',
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    }
  );
};

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate admin & return JWT token
 * @access  Public
 */
const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email address and password.',
      });
    }

    const admin = await Admin.findOne({ email: email.toLowerCase().trim() });

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Invalid administrative credentials.',
      });
    }

    const isMatch = await admin.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid administrative credentials.',
      });
    }

    const token = generateToken(admin._id);

    res.json({
      success: true,
      message: 'Authentication successful. Welcome to the Administration Portal.',
      token,
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (error) {
    console.error('[Login Error]', error);
    res.status(500).json({
      success: false,
      message: 'Server error during authentication.',
      error: error.message,
    });
  }
};

/**
 * @route   GET /api/auth/me
 * @desc    Get currently logged in admin details
 * @access  Private (Admin)
 */
const getAdminProfile = async (req, res) => {
  try {
    res.json({
      success: true,
      admin: {
        id: req.admin._id,
        name: req.admin.name,
        email: req.admin.email,
        role: req.admin.role,
        createdAt: req.admin.createdAt,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Could not fetch admin profile.',
    });
  }
};

/**
 * @route   POST /api/auth/setup-initial
 * @desc    Create the initial admin user if none exists (Secure bootstrapping)
 * @access  Public (Only executes when admin collection is completely empty)
 */
const setupInitialAdmin = async (req, res) => {
  try {
    const count = await Admin.countDocuments();
    if (count > 0) {
      return res.status(400).json({
        success: false,
        message: 'Admin account already initialized. Public registration is strictly disabled.',
      });
    }

    const initialEmail = process.env.ADMIN_INITIAL_EMAIL || 'admin@rajpatra.gov.in';
    const initialPassword = process.env.ADMIN_INITIAL_PASSWORD || 'Admin@12345';
    const initialName = process.env.ADMIN_INITIAL_NAME || 'System Administrator';

    const newAdmin = await Admin.create({
      name: initialName,
      email: initialEmail,
      password: initialPassword,
      role: 'superadmin',
    });

    res.status(201).json({
      success: true,
      message: 'Initial administrator created successfully.',
      admin: {
        id: newAdmin._id,
        name: newAdmin.name,
        email: newAdmin.email,
        role: newAdmin.role,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to initialize system administrator.',
      error: error.message,
    });
  }
};

module.exports = {
  loginAdmin,
  getAdminProfile,
  setupInitialAdmin,
};
