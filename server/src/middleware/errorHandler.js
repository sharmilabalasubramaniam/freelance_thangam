const { errorResponse } = require('../utils/response');

/**
 * 404 Route Not Found Middleware
 */
const notFoundHandler = (req, res, next) => {
  return errorResponse(res, `Route not found: ${req.method} ${req.originalUrl}`, 404);
};

/**
 * Centralized Application Error Handling Middleware
 */
const errorHandler = (err, req, res, next) => {
  // Log internal error trace safely on server
  console.error(`[Error] ${new Date().toISOString()} - ${req.method} ${req.originalUrl}:`, err.message);

  if (err.name === 'SyntaxError' && err.status === 400 && 'body' in err) {
    return errorResponse(res, 'Malformed JSON payload provided', 400);
  }

  const statusCode = err.statusCode || err.status || 500;
  const message = err.isOperational ? err.message : (process.env.NODE_ENV === 'production' ? 'An unexpected server error occurred' : err.message);

  return errorResponse(res, message, statusCode, err.errors || null);
};

module.exports = {
  notFoundHandler,
  errorHandler
};

