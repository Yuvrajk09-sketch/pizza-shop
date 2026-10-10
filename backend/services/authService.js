const { User } = require('../models');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

class AuthService {
  async register(full_name, email, password) {
    const existing = await User.findOne({ where: { email } });
    if (existing) throw new Error("Email already registered");
    
    const hashed_password = await bcrypt.hash(password, 10);
    const user = await User.create({
      full_name,
      email,
      hashed_password,
      is_admin: false
    });
    
    const token = jwt.sign(
      { sub: user.email, user_id: user.id, is_admin: user.is_admin },
      process.env.JWT_SECRET || 'supersecretjwtkey',
      { expiresIn: '24h' }
    );
    return { 
      access_token: token, 
      token_type: 'bearer',
      user_name: user.full_name,
      email: user.email,
      is_admin: user.is_admin
    };
  }

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
    return { 
      access_token: token, 
      token_type: 'bearer',
      user_name: user.full_name,
      email: user.email,
      is_admin: user.is_admin
    };
  }

  async getMe(userId) {
    const user = await User.findByPk(userId);
    if (!user) throw new Error("User not found");
    return user;
  }
}

module.exports = new AuthService();
