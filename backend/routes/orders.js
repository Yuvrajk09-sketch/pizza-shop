const express = require('express');
const router = express.Router();
const ordersController = require('../controllers/ordersController');
const { optionalAuth, authenticateToken } = require('../middleware/auth');

router.post('/', optionalAuth, ordersController.createOrder);
router.get('/my-orders', authenticateToken, ordersController.getMyOrders);
router.get('/:id', ordersController.getOrder);

module.exports = router;
