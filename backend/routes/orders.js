const express = require('express');
const router = express.Router();
const ordersController = require('../controllers/ordersController');
const { authenticateToken } = require('../middleware/auth');

router.post('/', authenticateToken, ordersController.createOrder);
router.get('/my-orders', authenticateToken, ordersController.getMyOrders);
router.get('/:id', ordersController.getOrder);
router.post('/:id/verify-payment', ordersController.verifyPayment);

module.exports = router;
