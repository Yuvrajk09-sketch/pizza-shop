const authService = require('../services/authService');

exports.register = async (req, res) => {
  try {
    const { full_name, email, password } = req.body;
    const tokenData = await authService.register(full_name, email, password);
    res.json(tokenData);
  } catch (error) {
    res.status(400).json({ detail: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const tokenData = await authService.login(email, password);
    res.json(tokenData);
  } catch (error) {
    res.status(401).json({ detail: error.message });
  }
};

const { Order, User } = require('../models');

exports.getMe = async (req, res) => {
  try {
    const user = await authService.getMe(req.user.user_id);
    let address = user.delivery_address;
    let phone = user.phone;
    if (!address || !phone) {
      const latestOrder = await Order.findOne({
        where: { user_id: user.id },
        order: [['created_at', 'DESC']]
      });
      if (latestOrder) {
        if (!address) address = `${latestOrder.delivery_address}, ${latestOrder.delivery_city}`;
        if (!phone) phone = latestOrder.customer_phone;
        // Cache to User record so future calls never need this lookup again
        await User.update({ delivery_address: address, phone }, { where: { id: user.id } });
      }
    }
    res.json({
      id: user.id,
      full_name: user.full_name,
      email: user.email,
      delivery_address: address || 'Linking Road, Bandra West, Mumbai',
      phone: phone || '+91 98765 43210',
      is_admin: user.is_admin
    });
  } catch (error) {
    res.status(404).json({ detail: error.message });
  }
};

exports.updateMe = async (req, res) => {
  try {
    const { full_name, delivery_address, phone } = req.body;
    const user = await authService.updateMe(req.user.user_id, { full_name, delivery_address, phone });
    res.json({
      id: user.id,
      full_name: user.full_name,
      email: user.email,
      delivery_address: user.delivery_address,
      phone: user.phone,
      is_admin: user.is_admin
    });
  } catch (error) {
    res.status(400).json({ detail: error.message });
  }
};
