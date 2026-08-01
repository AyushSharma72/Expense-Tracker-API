const logger = require('../utils/logger');
const AppError = require('../utils/AppError');

function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || 500;
  const message =
    err instanceof AppError || err.isOperational
      ? err.message
      : 'Internal server error';

  if (statusCode >= 500) {
    logger.error('Unhandled error', {
      message: err.message,
      stack: err.stack,
      path: req.originalUrl,
      method: req.method,
    });
  } else {
    logger.warn('Request error', {
      message: err.message,
      statusCode,
      path: req.originalUrl,
      method: req.method,
    });
  }

  res.status(statusCode).json({
    success: false,
    message,
  });
}

module.exports = errorHandler;
