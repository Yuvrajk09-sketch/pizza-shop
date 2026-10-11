const { Pizza, Topping } = require('../models');

class MenuService {
  async getMenu() {
    const [pizzas, toppings] = await Promise.all([
      Pizza.findAll({ where: { is_custom: false } }),
      Topping.findAll()
    ]);
    const categories = [...new Set(pizzas.map(p => p.category))];
    return { pizzas, toppings, categories };
  }
}

module.exports = new MenuService();
