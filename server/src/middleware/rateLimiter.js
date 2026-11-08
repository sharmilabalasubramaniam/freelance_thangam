const rateLimit = require('express-rate-limit');
const { errorResponse } = require('../utils/response');

/**
 * Global API rate limiter
 */
const globalRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // Limit each IP to 300 requests per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    return errorResponse(res, 'Too many requests from this client, please try again after 15 minutes.', 429);
  }
});

/**
 * Strict login rate limiter to protect against credential brute force
 */
const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Max 10 attempts per 15 minutes per IP
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    return errorResponse(res, 'Too many login attempts from this IP. Please try again after 15 minutes.', 429);
  }
});

module.exports = {
  globalRateLimiter,
  loginRateLimiter
};
