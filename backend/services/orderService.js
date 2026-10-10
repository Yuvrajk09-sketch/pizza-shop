const { Order, OrderItem } = require('../models');
const { broadcast } = require('../websockets');

class OrderService {
  async createOrder(data) {
    // Generate order ID
    const today = new Date();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const random = Math.floor(1000 + Math.random() * 9000);
    const orderId = `SC-${mm}${dd}${random}`;

    const subtotal = data.items.reduce((sum, item) => sum + item.total_price, 0);
    const tax = subtotal * 0.08875;
    const delivery_fee = 3.99;
    const total_amount = subtotal + tax + delivery_fee;

    const order = await Order.create({
      id: orderId,
      customer_name: data.customer_name,
      customer_email: data.customer_email,
      customer_phone: data.customer_phone,
      delivery_address: data.delivery_address,
      delivery_city: data.delivery_city,
      delivery_notes: data.delivery_notes,
      payment_method: data.payment_method,
      subtotal, tax, delivery_fee, total_amount,
      status: 'received'
    });

    for (const item of data.items) {
      await OrderItem.create({
        order_id: orderId,
        pizza_id: item.pizza_id,
        pizza_name: item.pizza_name,
        size: item.size,
        crust_type: item.crust_type,
        sauce_type: item.sauce_type,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.total_price,
        selected_toppings: item.selected_toppings
      });
    }

    const fullOrder = await Order.findByPk(orderId, { include: ['items'] });
    broadcast('admin', { event: 'new_order', order: fullOrder });
    return fullOrder;
  }

  async getOrder(orderId) {
    const order = await Order.findByPk(orderId, { include: ['items'] });
    if (!order) throw new Error("Order not found");
    return order;
  }
}

module.exports = new OrderService();
