const authService = require('../services/authService');

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const tokenData = await authService.login(email, password);
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
