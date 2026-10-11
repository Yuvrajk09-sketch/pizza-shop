const orderService = require('../services/orderService');

exports.createOrder = async (req, res) => {
  try {
    const payload = req.body;
    payload.user_id = req.user.user_id;
    const order = await orderService.createOrder(payload);
    res.json(order);
  } catch (error) {
    console.error("Order creation error:", error.message);
    res.status(400).json({ detail: error.message || "Failed to create order" });
  }
};

exports.getOrder = async (req, res) => {
  try {
    const order = await orderService.getOrder(req.params.id);
    res.json(order);
  } catch (error) {
    res.status(404).json({ detail: error.message });
  }
};

exports.getMyOrders = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const orders = await orderService.getOrdersByUser(req.user.user_id, limit);
    res.json(orders);
  } catch (error) {
    res.status(500).json({ detail: "Internal Server Error" });
  }
};

exports.verifyPayment = async (req, res) => {
  try {
    const order = await orderService.verifyPayment(req.params.id);
    res.json(order);
  } catch (error) {
    console.error("Payment verification failure:", error.message);
    res.status(400).json({ detail: error.message || "Payment verification failed" });
  }
};
