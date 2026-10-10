const adminService = require('../services/adminService');

exports.getOrders = async (req, res) => {
  try {
    const orders = await adminService.getOrders();
    res.json(orders);
  } catch (error) {
    res.status(500).json({ detail: "Internal Server Error" });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const order = await adminService.updateOrderStatus(req.params.id, req.body.status);
    res.json(order);
  } catch (error) {
    res.status(404).json({ detail: error.message });
  }
};

exports.togglePizza = async (req, res) => {
  try {
    const result = await adminService.togglePizza(req.params.id);
    res.json(result);
  } catch (error) {
    res.status(404).json({ detail: error.message });
  }
};

exports.toggleTopping = async (req, res) => {
  try {
    const result = await adminService.toggleTopping(req.params.id);
    res.json(result);
  } catch (error) {
    res.status(404).json({ detail: error.message });
  }
};

exports.getAnalytics = async (req, res) => {
  try {
    const analytics = await adminService.getAnalytics();
    res.json(analytics);
  } catch (error) {
    res.status(500).json({ detail: "Internal Server Error" });
  }
};
