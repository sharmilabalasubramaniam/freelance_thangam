const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { Admin } = require('../models/admin.model');
const config = require('../config/env');

const SALT_ROUNDS = 10;

class MongoAuthService {
  async createAdmin({ email, password, name }) {
    if (!email || !password) {
      throw new Error('Email and password are required to create an admin');
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existing = await Admin.findOne({ email: normalizedEmail });
    if (existing) {
      throw new Error('Admin user with this email already exists');
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const newAdmin = await Admin.create({
      id: `ADM-${uuidv4().replace(/-/g, '').slice(0, 6).toUpperCase()}`,
      email: normalizedEmail,
      name: name ? name.trim() : 'Operations Staff',
      passwordHash,
      role: 'admin'
    });

    return newAdmin.toJSON();
  }

  async login(email, password) {
    if (!email || !password) {
      const err = new Error('Email and password are required');
      err.statusCode = 400;
      throw err;
    }

    const normalizedEmail = email.trim().toLowerCase();
    const admin = await Admin.findOne({ email: normalizedEmail });

    if (!admin) {
      const err = new Error('Invalid email or password');
      err.statusCode = 401;
      throw err;
    }

    const isMatch = await bcrypt.compare(password, admin.passwordHash);
    if (!isMatch) {
      const err = new Error('Invalid email or password');
      err.statusCode = 401;
      throw err;
    }

    const tokenPayload = {
      id: admin.id,
      email: admin.email,
      name: admin.name,
      role: admin.role
    };

    const token = jwt.sign(tokenPayload, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn
    });

    return {
      user: admin.toJSON(),
      token
    };
  }

  async verifyToken(token) {
    if (!token) return null;
    try {
      const decoded = jwt.verify(token, config.jwt.secret);
      const admin = await Admin.findOne({ id: decoded.id });
      return admin ? admin.toJSON() : null;
    } catch (err) {
      return null;
    }
  }

  async seedInitialAdmin() {
    const count = await Admin.countDocuments();
    if (count > 0) {
      return { created: false, message: 'Admin user already exists in MongoDB Atlas' };
    }

    if (!config.adminSeed.password) {
      throw new Error('Cannot seed initial admin: INITIAL_ADMIN_PASSWORD is not set in environment');
    }

    const user = await this.createAdmin({
      email: config.adminSeed.email,
      password: config.adminSeed.password,
      name: config.adminSeed.name
    });

    return { created: true, email: user.email, message: 'Initial admin successfully provisioned in MongoDB Atlas' };
  }
}

module.exports = MongoAuthService;

