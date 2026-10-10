const express = require('express');
const { Order, OrderItem, Pizza, Topping } = require('../models');
const { broadcast } = require('../websockets');

const router = express.Router();

function generateOrderId() {
  const randomNum = Math.floor(10000 + Math.random() * 90000);
  return `SC-${randomNum}`;
}

router.post('/', async (req, res) => {
  try {
    const payload = req.body;
    if (!payload.items || payload.items.length === 0) {
      return res.status(400).json({ detail: "Order must contain at least one item." });
    }

    let order_id = generateOrderId();
    let existing = await Order.findByPk(order_id);
    while (existing) {
      order_id = generateOrderId();
      existing = await Order.findByPk(order_id);
    }

    const subtotal = payload.items.reduce((sum, item) => sum + item.total_price, 0);
    const delivery_fee = 3.99;
    const tax = Number((subtotal * 0.08875).toFixed(2));
    const total_amount = Number((subtotal + tax + delivery_fee).toFixed(2));

    const order = await Order.create({
      id: order_id,
      customer_name: payload.customer_name,
      customer_email: payload.customer_email,
      customer_phone: payload.customer_phone,
      delivery_address: payload.delivery_address,
      delivery_city: payload.delivery_city,
      delivery_notes: payload.delivery_notes,
      status: "received",
      subtotal: Number(subtotal.toFixed(2)),
      tax,
      delivery_fee,
      total_amount,
      payment_method: payload.payment_method,
      estimated_delivery_time: "30-40 mins"
    });

    for (const itm of payload.items) {
      await OrderItem.create({
        order_id: order_id,
        pizza_id: itm.pizza_id,
        pizza_name: itm.pizza_name,
        size: itm.size,
        crust_type: itm.crust_type,
        sauce_type: itm.sauce_type,
        quantity: itm.quantity,
        unit_price: itm.unit_price,
        total_price: itm.total_price,
        selected_toppings: itm.selected_toppings
      });
    }

    const fullOrder = await Order.findByPk(order_id, { include: ['items'] });

    broadcast('admin', { event: 'new_order', order: fullOrder });

    res.status(201).json(fullOrder);
  } catch (error) {
    console.error(error);
    res.status(500).json({ detail: "Internal Server Error" });
  }
});

router.get('/:order_id', async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.order_id, { include: ['items'] });
    if (!order) {
      return res.status(404).json({ detail: `Order ${req.params.order_id} not found.` });
    }
    res.json(order);
  } catch (error) {
    res.status(500).json({ detail: "Internal Server Error" });
  }
});

module.exports = router;
