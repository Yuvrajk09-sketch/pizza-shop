const { User } = require('../models');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

class AuthService {
  async register(full_name, email, password) {
    const existing = await User.findOne({ where: { email } });
    if (existing) throw new Error("Email already registered");
    
    const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS, 10) || 10;
    const hashed_password = await bcrypt.hash(password, saltRounds);
    const user = await User.create({
      full_name,
      email,
      hashed_password,
      is_admin: false
    });
    
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) throw new Error("JWT_SECRET is missing from environment configuration");

    const token = jwt.sign(
      { sub: user.email, user_id: user.id, is_admin: user.is_admin },
      jwtSecret,
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
    
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) throw new Error("JWT_SECRET is missing from environment configuration");

    const token = jwt.sign(
      { sub: user.email, user_id: user.id, is_admin: user.is_admin },
      jwtSecret,
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

  async updateMe(userId, data) {
    const updateFields = {};
    if (data.full_name) updateFields.full_name = data.full_name.trim();
    if (data.delivery_address !== undefined) updateFields.delivery_address = data.delivery_address ? data.delivery_address.trim() : null;
    if (data.phone !== undefined) updateFields.phone = data.phone ? data.phone.trim() : null;

    await User.update(updateFields, { where: { id: userId } });
    return { id: userId, ...updateFields };
  }
}

module.exports = new AuthService();
