const orderService = require('../services/orderService');

exports.createOrder = async (req, res) => {
  try {
    const payload = req.body;
    if (req.user) {
      payload.user_id = req.user.user_id;
    }
    const order = await orderService.createOrder(payload);
    res.json(order);
  } catch (error) {
    console.error(error);
    res.status(500).json({ detail: "Internal Server Error" });
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
    const orders = await orderService.getOrdersByUser(req.user.user_id);
    res.json(orders);
  } catch (error) {
    res.status(500).json({ detail: "Internal Server Error" });
  }
};
