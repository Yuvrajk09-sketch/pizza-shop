import os

backend_dir = r"c:\Users\ASUS\Desktop\newone\backend"
dirs = ["controllers", "services"]

for d in dirs:
    os.makedirs(os.path.join(backend_dir, d), exist_ok=True)

# 1. MENU
menu_service = """const { Pizza, Topping } = require('../models');

class MenuService {
  async getMenu() {
    const pizzas = await Pizza.findAll({ where: { is_custom: false } });
    const toppings = await Topping.findAll();
    const categories = [...new Set(pizzas.map(p => p.category))];
    return { pizzas, toppings, categories };
  }
}

module.exports = new MenuService();
"""

menu_controller = """const menuService = require('../services/menuService');

exports.getMenu = async (req, res) => {
  try {
    const menu = await menuService.getMenu();
    res.json(menu);
  } catch (error) {
    console.error(error);
    res.status(500).json({ detail: "Internal Server Error" });
  }
};
"""

menu_route = """const express = require('express');
const router = express.Router();
const menuController = require('../controllers/menuController');

router.get('/', menuController.getMenu);

module.exports = router;
"""

with open(os.path.join(backend_dir, "services", "menuService.js"), "w") as f: f.write(menu_service)
with open(os.path.join(backend_dir, "controllers", "menuController.js"), "w") as f: f.write(menu_controller)
with open(os.path.join(backend_dir, "routes", "menu.js"), "w") as f: f.write(menu_route)

# 2. AUTH
auth_service = """const { User } = require('../models');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

class AuthService {
  async login(email, password) {
    const user = await User.findOne({ where: { email } });
    if (!user) throw new Error("Incorrect email or password");
    
    const valid = await bcrypt.compare(password, user.hashed_password);
    if (!valid) throw new Error("Incorrect email or password");
    
    const token = jwt.sign(
      { sub: user.email, user_id: user.id, is_admin: user.is_admin },
      process.env.JWT_SECRET || 'supersecretjwtkey',
      { expiresIn: '24h' }
    );
    return { access_token: token, token_type: 'bearer' };
  }

  async getMe(userId) {
    const user = await User.findByPk(userId);
    if (!user) throw new Error("User not found");
    return user;
  }
}

module.exports = new AuthService();
"""

auth_controller = """const authService = require('../services/authService');

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const tokenData = await authService.login(username, password);
    res.json(tokenData);
  } catch (error) {
    res.status(401).json({ detail: error.message });
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await authService.getMe(req.user.user_id);
    res.json(user);
  } catch (error) {
    res.status(404).json({ detail: error.message });
  }
};
"""

auth_route = """const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { requireAdmin } = require('../middleware/auth');

router.post('/login', authController.login);
router.get('/me', requireAdmin, authController.getMe);

module.exports = router;
"""
with open(os.path.join(backend_dir, "services", "authService.js"), "w") as f: f.write(auth_service)
with open(os.path.join(backend_dir, "controllers", "authController.js"), "w") as f: f.write(auth_controller)
with open(os.path.join(backend_dir, "routes", "auth.js"), "w") as f: f.write(auth_route)

# 3. ORDERS
orders_service = """const { Order, OrderItem } = require('../models');
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
"""

orders_controller = """const orderService = require('../services/orderService');

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
"""

orders_route = """const express = require('express');
const router = express.Router();
const ordersController = require('../controllers/ordersController');

router.post('/', ordersController.createOrder);
router.get('/:id', ordersController.getOrder);

module.exports = router;
"""
with open(os.path.join(backend_dir, "services", "orderService.js"), "w") as f: f.write(orders_service)
with open(os.path.join(backend_dir, "controllers", "ordersController.js"), "w") as f: f.write(orders_controller)
with open(os.path.join(backend_dir, "routes", "orders.js"), "w") as f: f.write(orders_route)

# 4. ADMIN
admin_service = """const { Order, Pizza, Topping } = require('../models');
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
"""

admin_controller = """const adminService = require('../services/adminService');

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
"""

admin_route = """const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { requireAdmin } = require('../middleware/auth');

router.get('/orders', requireAdmin, adminController.getOrders);
router.patch('/orders/:id/status', requireAdmin, adminController.updateOrderStatus);
router.post('/menu/pizza/:id/toggle', requireAdmin, adminController.togglePizza);
router.post('/menu/topping/:id/toggle', requireAdmin, adminController.toggleTopping);
router.get('/analytics', requireAdmin, adminController.getAnalytics);

module.exports = router;
"""
with open(os.path.join(backend_dir, "services", "adminService.js"), "w") as f: f.write(admin_service)
with open(os.path.join(backend_dir, "controllers", "adminController.js"), "w") as f: f.write(admin_controller)
with open(os.path.join(backend_dir, "routes", "admin.js"), "w") as f: f.write(admin_route)

print("MVC Refactoring Complete!")
