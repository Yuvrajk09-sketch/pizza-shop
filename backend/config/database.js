require('dotenv').config();
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(process.env.DATABASE_URL || 'mysql://root:root@localhost:3306/pizza_app', {
  dialect: 'mysql',
  logging: false,
});

module.exports = sequelize;
