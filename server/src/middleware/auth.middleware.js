const { getAuthService } = require('../services/storageFactory');
const { errorResponse } = require('../utils/response');
const config = require('../config/env');

/**
 * Middleware ensuring valid admin JWT authentication
 */
const requireAdminAuth = async (req, res, next) => {
  try {
    const authService = getAuthService();
    let token = null;

    if (req.cookies && req.cookies[config.jwt.cookieName]) {
      token = req.cookies[config.jwt.cookieName];
    }

    if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return errorResponse(res, 'Authentication required. Please log in to access admin operations.', 401);
    }

    const admin = await authService.verifyToken(token);
    if (!admin) {
      return errorResponse(res, 'Session expired or invalid credentials. Please log in again.', 401);
    }

    req.admin = admin;
    next();
  } catch (err) {
    return errorResponse(res, 'Authentication failed: ' + err.message, 401);
  }
};

module.exports = {
  requireAdminAuth
};
