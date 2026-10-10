const express = require('express');
const router = express.Router();
const ordersController = require('../controllers/ordersController');

router.post('/', ordersController.createOrder);
router.get('/:id', ordersController.getOrder);

module.exports = router;
