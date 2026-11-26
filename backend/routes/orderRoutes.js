const express = require('express');
const router = express.Router();
const {
  getPublicOrders,
  getPublicOrderById,
  getDepartments,
  getCategories,
  summarizeOrder,
} = require('../controllers/orderController');

// Public government order endpoints
router.get('/', getPublicOrders);
router.get('/meta/departments', getDepartments);
router.get('/meta/categories', getCategories);
router.post('/summarize', summarizeOrder);
router.get('/:id', getPublicOrderById);

module.exports = router;
