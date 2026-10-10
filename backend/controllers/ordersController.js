const orderService = require('../services/orderService');

exports.createOrder = async (req, res) => {
  try {
    const order = await orderService.createOrder(req.body);
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
