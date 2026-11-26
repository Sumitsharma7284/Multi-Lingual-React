const express = require('express');
const router = express.Router();
const {
  getAllOrdersAdmin,
  getOrderByIdAdmin,
  createOrder,
  updateOrder,
  togglePublishStatus,
  deleteOrder,
  getOrderStats,
} = require('../controllers/orderController');
const { protectAdmin } = require('../middleware/authMiddleware');
const uploadPDF = require('../middleware/uploadMiddleware');

// Protect all admin order routes
router.use(protectAdmin);

// Dashboard stats
router.get('/stats/summary', getOrderStats);

// Orders CRUD
router.get('/', getAllOrdersAdmin);
router.get('/:id', getOrderByIdAdmin);
router.post('/', uploadPDF.single('pdf'), createOrder);
router.put('/:id', uploadPDF.single('pdf'), updateOrder);
router.patch('/:id/status', togglePublishStatus);
router.delete('/:id', deleteOrder);

module.exports = router;
