const { sequelize, Order, OrderItem, User } = require('../models');
const { broadcast } = require('../websockets');
const { Op } = require('sequelize');
const axios = require('axios');

class OrderService {
  async checkCashfreePaymentStatus(orderId) {
    try {
      const headers = {
        'x-client-id': process.env.CASHFREE_APP_ID,
        'x-client-secret': process.env.CASHFREE_SECRET_KEY,
        'x-api-version': '2023-08-01',
        'Accept': 'application/json'
      };

      // 1. Fetch order details directly from Cashfree
      const orderRes = await axios.get(`https://sandbox.cashfree.com/pg/orders/${orderId}`, { headers });
      const cfOrder = orderRes.data;

      // 2. Fetch payments attempts directly from Cashfree
      let payments = [];
      try {
        const paymentsRes = await axios.get(`https://sandbox.cashfree.com/pg/orders/${orderId}/payments`, { headers });
        payments = paymentsRes.data || [];
      } catch (err) {
        console.warn(`Could not fetch payments list for ${orderId}:`, err.message);
      }

      const successfulPayment = payments.find(p => p.payment_status === 'SUCCESS');

      if (cfOrder.order_status === 'PAID' || successfulPayment) {
        const txnId = successfulPayment?.cf_payment_id
          ? String(successfulPayment.cf_payment_id)
          : (cfOrder.cf_order_id ? String(cfOrder.cf_order_id) : `CF-${Date.now()}`);
        return {
          isPaid: true,
          transaction_id: txnId,
          order_status: 'PAID',
          payment_details: successfulPayment || cfOrder
        };
      }

      const failedPayment = payments.find(p => ['FAILED', 'USER_DROPPED', 'CANCELLED'].includes(p.payment_status));
      const reason = failedPayment?.payment_message
        || (cfOrder.order_status === 'ACTIVE'
          ? 'Payment was not completed or cancelled by customer'
          : `Cashfree order status: ${cfOrder.order_status}`);

      return {
        isPaid: false,
        reason,
        order_status: cfOrder.order_status,
        payment_details: failedPayment || cfOrder
      };
    } catch (err) {
      console.error("Cashfree API verification error:", err.response?.data || err.message);
      throw new Error(`Cashfree Verification Error: ${err.response?.data?.message || err.message}`);
    }
  }

  async createOrder(data) {
    // Generate chronological sequential order ID (strictly ordered in MySQL)
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const hh = String(now.getHours()).padStart(2, '0');
    const min = String(now.getMinutes()).padStart(2, '0');
    const ss = String(now.getSeconds()).padStart(2, '0');
    const rand = Math.floor(100 + Math.random() * 900);
    const orderId = `SC-${yyyy}${mm}${dd}-${hh}${min}${ss}-${rand}`;

    const subtotal = data.items.reduce((sum, item) => sum + item.total_price, 0);
    const tax = Number((subtotal * 0.05).toFixed(2)); // 5% GST (2.5% CGST + 2.5% SGST)
    const delivery_fee = 49.00; // Flat ₹49 delivery
    const total_amount = Number((subtotal + tax + delivery_fee).toFixed(2));

    const isCard = data.payment_method === 'card';
    const initialStatus = isCard ? 'pending_payment' : 'received';
    const initialPaymentStatus = isCard ? 'pending' : 'cash_on_delivery';

    // Format and sanitize Indian phone number (+91 10-digit)
    let rawPhone = String(data.customer_phone || '').replace(/\D/g, '');
    if (rawPhone.startsWith('91') && rawPhone.length > 10) {
      rawPhone = rawPhone.slice(2);
    }
    let validDigits = rawPhone.slice(-10);
    if (!/^[6-9]\d{9}$/.test(validDigits)) {
      validDigits = '9876543210';
    }
    const formattedPhone = `+91 ${validDigits.slice(0, 5)} ${validDigits.slice(5)}`;

    // If card payment, initiate session with Cashfree FIRST before creating DB rows
    let payment_session_id = null;
    if (isCard) {
      try {
        const response = await axios.post('https://sandbox.cashfree.com/pg/orders', {
          order_id: orderId,
          order_amount: total_amount,
          order_currency: "INR",
          customer_details: {
            customer_id: data.user_id ? String(data.user_id) : 'guest_123',
            customer_name: data.customer_name || 'Guest User',
            customer_email: data.customer_email,
            customer_phone: validDigits
          }
        }, {
          headers: {
            'x-client-id': process.env.CASHFREE_APP_ID,
            'x-client-secret': process.env.CASHFREE_SECRET_KEY,
            'x-api-version': '2023-08-01',
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        });
        payment_session_id = response.data.payment_session_id;
      } catch (err) {
        console.error("Cashfree Error:", err.response?.data || err.message);
        throw new Error("Failed to initiate online payment with Cashfree. Please try Cash on Delivery.");
      }
    }

    // ATOMIC DATABASE TRANSACTION
    const t = await sequelize.transaction();
    let order;
    let orderItems;
    try {
      // 1. Create Order
      order = await Order.create({
        id: orderId,
        customer_name: data.customer_name,
        customer_email: data.customer_email,
        customer_phone: formattedPhone,
        delivery_address: data.delivery_address,
        delivery_city: data.delivery_city,
        delivery_notes: data.delivery_notes,
        payment_method: data.payment_method,
        payment_status: initialPaymentStatus,
        payment_session_id,
        subtotal, tax, delivery_fee, total_amount,
        status: initialStatus,
        user_id: data.user_id || null
      }, { transaction: t });

      // 2. Bulk insert all order items in 1 query inside the transaction
      const itemsPayload = data.items.map(item => ({
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
      }));
      orderItems = await OrderItem.bulkCreate(itemsPayload, { transaction: t });

      // 3. OPTIMIZATION: If user is logged in, auto-save address and phone to user profile if not set yet
      if (data.user_id) {
        await User.update({
          delivery_address: data.delivery_address,
          phone: formattedPhone
        }, {
          where: { id: data.user_id, delivery_address: null },
          transaction: t
        });
      }

      await t.commit();
    } catch (dbError) {
      await t.rollback();
      console.error("Database Transaction Error during order creation:", dbError.message);
      throw new Error(`Failed to save order: ${dbError.message}`);
    }

    const orderData = order.toJSON();
    orderData.items = orderItems.map(i => (i.toJSON ? i.toJSON() : i));
    if (payment_session_id) {
      orderData.payment_session_id = payment_session_id;
    }

    // Only broadcast confirmed cash-on-delivery orders immediately to admin kitchen
    if (!isCard) {
      broadcast('admin', { event: 'new_order', order: orderData });
    }
    return orderData;
  }

  async verifyPayment(orderId) {
    const order = await Order.findByPk(orderId, { include: ['items'] });
    if (!order) throw new Error("Order not found");

    if (order.payment_method !== 'card') {
      return order;
    }

    // Backend-to-backend verification with Cashfree API
    const verification = await this.checkCashfreePaymentStatus(orderId);

    if (verification.isPaid) {
      const paidAt = new Date();
      await order.update({
        status: 'received', // Now confirmed and visible to kitchen!
        payment_status: 'paid',
        transaction_id: verification.transaction_id,
        gateway_response: verification.payment_details,
        paid_at: paidAt
      });

      const updatedOrder = order.toJSON();
      updatedOrder.status = 'received';
      updatedOrder.payment_status = 'paid';
      updatedOrder.transaction_id = verification.transaction_id;
      updatedOrder.paid_at = paidAt;

      // Broadcast confirmed paid order to kitchen
      broadcast('admin', { event: 'new_order', order: updatedOrder });
      broadcast('admin', { event: 'payment_verified', orderId, payment_status: 'paid', transaction_id: verification.transaction_id });
      return updatedOrder;
    } else {
      // Payment was cancelled or failed with Cashfree — atomic removal in transaction
      const t = await sequelize.transaction();
      try {
        await OrderItem.destroy({ where: { order_id: orderId }, transaction: t });
        await order.destroy({ transaction: t });
        await t.commit();
      } catch (err) {
        await t.rollback();
        console.warn(`Error deleting cancelled order ${orderId}:`, err.message);
      }

      throw new Error(verification.reason || "Payment was cancelled or not completed on Cashfree.");
    }
  }

  async getOrder(orderId) {
    const order = await Order.findByPk(orderId, { include: ['items'] });
    if (!order) throw new Error("Order not found");
    return order;
  }

  async getOrdersByUser(userId, limit = 10) {
    return await Order.findAll({
      where: {
        user_id: userId,
        status: { [Op.notIn]: ['cancelled', 'pending_payment'] }
      },
      order: [['created_at', 'DESC']],
      limit: Number(limit) || 10,
      include: ['items']
    });
  }

  async purgeCancelledOrders() {
    const cancelledOrders = await Order.findAll({
      where: {
        [Op.or]: [
          { status: 'cancelled' },
          { status: 'pending_payment' },
          { payment_status: 'failed' }
        ]
      },
      attributes: ['id']
    });
    if (!cancelledOrders.length) return 0;
    const ids = cancelledOrders.map(o => o.id);
    const t = await sequelize.transaction();
    try {
      await OrderItem.destroy({ where: { order_id: { [Op.in]: ids } }, transaction: t });
      await Order.destroy({ where: { id: { [Op.in]: ids } }, transaction: t });
      await t.commit();
      return ids.length;
    } catch (err) {
      await t.rollback();
      throw err;
    }
  }
}

module.exports = new OrderService();
