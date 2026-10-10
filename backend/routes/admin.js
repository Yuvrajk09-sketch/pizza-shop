const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { requireAdmin } = require('../middleware/auth');

router.get('/orders', requireAdmin, adminController.getOrders);
router.patch('/orders/:id/status', requireAdmin, adminController.updateOrderStatus);
router.post('/menu/pizza/:id/toggle', requireAdmin, adminController.togglePizza);
router.post('/menu/topping/:id/toggle', requireAdmin, adminController.toggleTopping);
router.get('/analytics', requireAdmin, adminController.getAnalytics);

module.exports = router;
