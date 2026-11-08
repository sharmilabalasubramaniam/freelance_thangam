const { getAuthService } = require('../services/storageFactory');
const { successResponse, errorResponse } = require('../utils/response');
const config = require('../config/env');

const getCookieOptions = () => {
  const isProduction = config.env === 'production';
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'strict' : 'lax',
    maxAge: 24 * 60 * 60 * 1000,
    path: '/'
  };
};

const loginHandler = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return errorResponse(res, 'Email and password are required', 400);
    }

    const authService = getAuthService();
    const { user, token } = await authService.login(email, password);

    res.cookie(config.jwt.cookieName, token, getCookieOptions());

    return successResponse(res, { user, token }, 'Authentication successful');
  } catch (err) {
    if (err.statusCode === 401 || err.statusCode === 400) {
      return errorResponse(res, err.message, err.statusCode);
    }
    next(err);
  }
};

const getMeHandler = async (req, res) => {
  return successResponse(res, { user: req.admin }, 'Authenticated admin profile retrieved');
};

const logoutHandler = async (req, res) => {
  const isProduction = config.env === 'production';
  res.clearCookie(config.jwt.cookieName, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'strict' : 'lax',
    path: '/'
  });

  return successResponse(res, null, 'Logged out successfully');
};

module.exports = {
  loginHandler,
  getMeHandler,
  logoutHandler
};
