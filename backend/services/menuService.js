const { Pizza, Topping } = require('../models');

class MenuService {
  async getMenu() {
    const pizzas = await Pizza.findAll({ where: { is_custom: false } });
    const toppings = await Topping.findAll();
    const categories = [...new Set(pizzas.map(p => p.category))];
    return { pizzas, toppings, categories };
  }
}

module.exports = new MenuService();
