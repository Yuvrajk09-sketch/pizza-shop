const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });

    if (!user || !(await bcrypt.compare(password, user.hashed_password))) {
      return res.status(401).json({ detail: "Invalid email or password." });
    }

    const token = jwt.sign(
      { sub: user.email, is_admin: user.is_admin, id: user.id },
      process.env.JWT_SECRET || 'supersecretjwtkey',
      { expiresIn: '24h' }
    );

    res.json({
      access_token: token,
      token_type: "bearer",
      user_name: user.full_name,
      email: user.email,
      is_admin: user.is_admin
    });
  } catch (error) {
    res.status(500).json({ detail: "Internal Server Error" });
  }
});

router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['hashed_password'] }
    });
    if (!user) return res.status(404).json({ detail: "User not found." });
    res.json(user);
  } catch (error) {
    res.status(500).json({ detail: "Internal Server Error" });
  }
});

module.exports = router;
