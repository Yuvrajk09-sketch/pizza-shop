const { Order, Pizza, Topping } = require('../models');
const { broadcast } = require('../websockets');
const { Op } = require('sequelize');

class AdminService {
  async getOrders() {
    return await Order.findAll({
      order: [['created_at', 'DESC']],
      include: ['items']
    });
  }

  async updateOrderStatus(orderId, status) {
    const order = await Order.findByPk(orderId, { include: ['items'] });
    if (!order) throw new Error("Order not found");
    
    order.status = status;
    await order.save();
    
    broadcast('storefront', { event: 'status_changed', order });
    broadcast('admin', { event: 'status_changed', order });
    broadcast(`order_${order.id}`, { event: 'status_changed', order });
    
    return order;
  }

  async togglePizza(pizzaId) {
    const pizza = await Pizza.findByPk(pizzaId);
    if (!pizza) throw new Error("Pizza not found");
    pizza.is_available = !pizza.is_available;
    await pizza.save();
    return { success: true, is_available: pizza.is_available };
  }

  async toggleTopping(toppingId) {
    const topping = await Topping.findByPk(toppingId);
    if (!topping) throw new Error("Topping not found");
    topping.is_available = !topping.is_available;
    await topping.save();
    return { success: true, is_available: topping.is_available };
  }

  async getAnalytics() {
    const totalOrders = await Order.count();
    const deliveredOrders = await Order.findAll({ where: { status: 'delivered' } });
    const totalRevenue = deliveredOrders.reduce((sum, o) => sum + o.total_amount, 0);
    const activeOrders = await Order.count({ where: { status: { [Op.in]: ['received', 'baking', 'out_for_delivery'] } } });
    
    return {
      total_revenue: totalRevenue,
      total_orders: totalOrders,
      active_orders: activeOrders,
      avg_order_value: deliveredOrders.length ? totalRevenue / deliveredOrders.length : 0
    };
  }
}

module.exports = new AdminService();
