const express = require('express');
const { Order, Pizza, Topping } = require('../models');
const { requireAdmin } = require('../middleware/auth');
const { broadcast } = require('../websockets');
const { Op } = require('sequelize');

const router = express.Router();

router.use(requireAdmin);

router.get('/orders', async (req, res) => {
  try {
    const orders = await Order.findAll({
      order: [['created_at', 'DESC']],
      include: ['items']
    });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ detail: "Internal Server Error" });
  }
});

router.patch('/orders/:order_id/status', async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.order_id, { include: ['items'] });
    if (!order) return res.status(404).json({ detail: "Order not found." });

    order.status = req.body.status;
    await order.save();

    broadcast('storefront', { event: 'status_changed', order });
    broadcast('admin', { event: 'status_changed', order });
    broadcast(`order_${order.id}`, { event: 'status_changed', order });

    res.json(order);
  } catch (error) {
    res.status(500).json({ detail: "Internal Server Error" });
  }
});

router.patch('/pizzas/:pizza_id/toggle-stock', async (req, res) => {
  try {
    const pizza = await Pizza.findByPk(req.params.pizza_id);
    if (!pizza) return res.status(404).json({ detail: "Pizza not found." });

    pizza.is_available = !pizza.is_available;
    await pizza.save();

    broadcast('admin', { event: 'menu_updated' });
    broadcast('storefront', { event: 'menu_updated' });

    res.json(pizza);
  } catch (error) {
    res.status(500).json({ detail: "Internal Server Error" });
  }
});

router.patch('/toppings/:topping_id/toggle-stock', async (req, res) => {
  try {
    const topping = await Topping.findByPk(req.params.topping_id);
    if (!topping) return res.status(404).json({ detail: "Topping not found." });

    topping.is_available = !topping.is_available;
    await topping.save();

    broadcast('admin', { event: 'menu_updated' });
    broadcast('storefront', { event: 'menu_updated' });

    res.json(topping);
  } catch (error) {
    res.status(500).json({ detail: "Internal Server Error" });
  }
});

router.get('/analytics', async (req, res) => {
  try {
    const totalOrders = await Order.count();
    const completedOrders = await Order.count({ where: { status: 'delivered' } });
    const activeOrders = await Order.count({ where: { status: { [Op.in]: ['received', 'baking', 'out_for_delivery'] } } });
    const lowStockToppingsCount = await Topping.count({ where: { stock_count: { [Op.lt]: 50 } } });
    const recentOrders = await Order.findAll({ order: [['created_at', 'DESC']], limit: 5, include: ['items'] });
    
    let totalRevenue = await Order.sum('total_amount', { where: { status: 'delivered' } }) || 0.0;

    res.json({
      total_revenue: totalRevenue,
      total_orders: totalOrders,
      active_orders: activeOrders,
      completed_orders: completedOrders,
      low_stock_toppings_count: lowStockToppingsCount,
      recent_orders: recentOrders
    });
  } catch (error) {
    res.status(500).json({ detail: "Internal Server Error" });
  }
});

module.exports = router;
