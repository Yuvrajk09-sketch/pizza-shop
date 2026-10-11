const sequelize = require('../config/database');
const { DataTypes } = require('sequelize');

const User = sequelize.define('User', {
  email: { type: DataTypes.STRING, unique: true, allowNull: false },
  hashed_password: { type: DataTypes.STRING, allowNull: false },
  full_name: { type: DataTypes.STRING, allowNull: false },
  delivery_address: { type: DataTypes.TEXT, allowNull: true },
  phone: { type: DataTypes.STRING, allowNull: true },
  is_admin: { type: DataTypes.BOOLEAN, defaultValue: false }
}, { tableName: 'users', timestamps: true, createdAt: 'created_at', updatedAt: false });

const Pizza = sequelize.define('Pizza', {
  name: { type: DataTypes.STRING, allowNull: false },
  slug: { type: DataTypes.STRING, unique: true, allowNull: false },
  description: { type: DataTypes.TEXT, allowNull: false },
  category: { type: DataTypes.STRING, defaultValue: 'Signature' },
  price_small: { type: DataTypes.FLOAT, defaultValue: 499.0 },
  price_medium: { type: DataTypes.FLOAT, defaultValue: 699.0 },
  price_large: { type: DataTypes.FLOAT, defaultValue: 899.0 },
  image_url: { type: DataTypes.STRING },
  is_available: { type: DataTypes.BOOLEAN, defaultValue: true },
  is_custom: { type: DataTypes.BOOLEAN, defaultValue: false },
  default_toppings: { type: DataTypes.JSON, defaultValue: [] }
}, { tableName: 'pizzas', timestamps: true, createdAt: 'created_at', updatedAt: false });

const Topping = sequelize.define('Topping', {
  name: { type: DataTypes.STRING, unique: true, allowNull: false },
  category: { type: DataTypes.STRING, defaultValue: 'veggie' },
  price: { type: DataTypes.FLOAT, defaultValue: 79.0 },
  color_hex: { type: DataTypes.STRING, defaultValue: '#FF5722' },
  geometry_type: { type: DataTypes.STRING, defaultValue: 'sphere' },
  is_available: { type: DataTypes.BOOLEAN, defaultValue: true },
  stock_count: { type: DataTypes.INTEGER, defaultValue: 100 }
}, { tableName: 'toppings', timestamps: true, createdAt: 'created_at', updatedAt: false });

const Order = sequelize.define('Order', {
  id: { type: DataTypes.STRING, primaryKey: true },
  customer_name: { type: DataTypes.STRING, allowNull: false },
  customer_email: { type: DataTypes.STRING, allowNull: false },
  customer_phone: { type: DataTypes.STRING, allowNull: false },
  delivery_address: { type: DataTypes.TEXT, allowNull: false },
  delivery_city: { type: DataTypes.STRING, defaultValue: 'Mumbai' },
  delivery_notes: { type: DataTypes.TEXT },
  status: { type: DataTypes.STRING, defaultValue: 'received' },
  subtotal: { type: DataTypes.FLOAT, defaultValue: 0.0 },
  tax: { type: DataTypes.FLOAT, defaultValue: 0.0 },
  delivery_fee: { type: DataTypes.FLOAT, defaultValue: 49.0 },
  total_amount: { type: DataTypes.FLOAT, defaultValue: 0.0 },
  payment_method: { type: DataTypes.STRING, defaultValue: 'card' },
  payment_status: { type: DataTypes.STRING, defaultValue: 'pending' },
  payment_session_id: { type: DataTypes.STRING, allowNull: true },
  transaction_id: { type: DataTypes.STRING, allowNull: true },
  gateway_response: { type: DataTypes.JSON, allowNull: true },
  paid_at: { type: DataTypes.DATE, allowNull: true },
  estimated_delivery_time: { type: DataTypes.STRING }
}, { 
  tableName: 'orders', 
  timestamps: true, 
  createdAt: 'created_at', 
  updatedAt: 'updated_at',
  indexes: [
    { fields: ['status'] },
    { fields: ['user_id'] },
    { fields: ['user_id', 'created_at'] },
    { fields: ['created_at'] },
    { fields: ['status', 'created_at'] },
    { fields: ['transaction_id'] }
  ]
});

const OrderItem = sequelize.define('OrderItem', {
  pizza_name: { type: DataTypes.STRING, allowNull: false },
  size: { type: DataTypes.STRING, defaultValue: 'medium' },
  crust_type: { type: DataTypes.STRING, defaultValue: 'neapolitan' },
  sauce_type: { type: DataTypes.STRING, defaultValue: 'marinara' },
  quantity: { type: DataTypes.INTEGER, defaultValue: 1 },
  unit_price: { type: DataTypes.FLOAT, defaultValue: 0.0 },
  total_price: { type: DataTypes.FLOAT, defaultValue: 0.0 },
  selected_toppings: { type: DataTypes.JSON, defaultValue: [] }
}, { 
  tableName: 'order_items', 
  timestamps: false,
  indexes: [
    { fields: ['order_id'] }
  ]
});

// Relationships
User.hasMany(Order, { foreignKey: 'user_id' });
Order.belongsTo(User, { foreignKey: 'user_id' });

Order.hasMany(OrderItem, { foreignKey: 'order_id', as: 'items', onDelete: 'CASCADE' });
OrderItem.belongsTo(Order, { foreignKey: 'order_id', onDelete: 'CASCADE' });

Pizza.hasMany(OrderItem, { foreignKey: 'pizza_id' });
OrderItem.belongsTo(Pizza, { foreignKey: 'pizza_id' });

module.exports = { sequelize, User, Pizza, Topping, Order, OrderItem };
