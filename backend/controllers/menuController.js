const menuService = require('../services/menuService');

exports.getMenu = async (req, res) => {
  try {
    const menu = await menuService.getMenu();
    res.json(menu);
  } catch (error) {
    console.error(error);
    res.status(500).json({ detail: "Internal Server Error" });
  }
};
