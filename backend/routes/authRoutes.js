const express = require('express');
const router = express.Router();
const {
  loginAdmin,
  getAdminProfile,
  setupInitialAdmin,
} = require('../controllers/authController');
const { protectAdmin } = require('../middleware/authMiddleware');

// Public auth routes
router.post('/login', loginAdmin);
router.post('/setup-initial', setupInitialAdmin);

// Protected admin routes
router.get('/me', protectAdmin, getAdminProfile);

module.exports = router;
