const express = require('express');
const { Pizza, Topping } = require('../models');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const pizzas = await Pizza.findAll({ order: [['id', 'ASC']] });
    const toppings = await Topping.findAll({ order: [['id', 'ASC']] });

    let categories = [...new Set(pizzas.map(p => p.category).filter(Boolean))];
    if (categories.includes('Signature')) {
      categories = categories.filter(c => c !== 'Signature');
      categories.unshift('Signature');
    }

    res.json({
      pizzas,
      toppings,
      categories
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ detail: "Internal Server Error" });
  }
});

router.get('/pizzas', async (req, res) => {
  try {
    const { only_available } = req.query;
    const where = only_available === 'true' ? { is_available: true } : {};
    const pizzas = await Pizza.findAll({ where, order: [['id', 'ASC']] });
    res.json(pizzas);
  } catch (error) {
    res.status(500).json({ detail: "Internal Server Error" });
  }
});

router.get('/toppings', async (req, res) => {
  try {
    const { only_available } = req.query;
    const where = only_available === 'true' ? { is_available: true } : {};
    const toppings = await Topping.findAll({ where, order: [['id', 'ASC']] });
    res.json(toppings);
  } catch (error) {
    res.status(500).json({ detail: "Internal Server Error" });
  }
});

module.exports = router;
