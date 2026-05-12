const AppError = require('../errors/AppError');
const { sendError } = require('../utils/apiResponse');
const { nodeEnv } = require('../../config/env');

/**
 * Global Express error handler middleware
 * Must be registered LAST in the middleware chain
 */
const errorHandler = (err, req, res, next) => {
  // Log error (in production, send to monitoring service)
  if (nodeEnv !== 'test') {
    console.error('❌ Error:', {
      message: err.message,
      errorCode: err.errorCode,
      statusCode: err.statusCode,
      path: req.path,
      method: req.method,
      stack: nodeEnv === 'development' ? err.stack : undefined,
    });
  }

  // Handle known operational errors
  if (err instanceof AppError && err.isOperational) {
    return sendError(res, {
      message: err.message,
      errorCode: err.errorCode,
      statusCode: err.statusCode,
    });
  }

  // Handle Mongoose validation errors
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
    return sendError(res, {
      message: 'Validation failed',
      errorCode: 'VALIDATION_ERROR',
      statusCode: 422,
      errors,
    });
  }

  // Handle Mongoose cast errors (invalid ObjectId)
  if (err.name === 'CastError') {
    return sendError(res, {
      message: `Invalid ${err.path}: ${err.value}`,
      errorCode: 'INVALID_ID',
      statusCode: 400,
    });
  }

  // Handle Mongoose duplicate key errors
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return sendError(res, {
      message: `${field} already exists`,
      errorCode: 'DUPLICATE_ERROR',
      statusCode: 409,
    });
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    return sendError(res, {
      message: 'Invalid token',
      errorCode: 'INVALID_TOKEN',
      statusCode: 401,
    });
  }

  if (err.name === 'TokenExpiredError') {
    return sendError(res, {
      message: 'Token has expired',
      errorCode: 'TOKEN_EXPIRED',
      statusCode: 401,
    });
  }

  // Handle Zod validation errors
  if (err.name === 'ZodError') {
    const errors = err.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));
    return sendError(res, {
      message: 'Validation failed',
      errorCode: 'VALIDATION_ERROR',
      statusCode: 400,
      errors,
    });
  }

  // Generic server error - don't leak details in production
  return sendError(res, {
    message: nodeEnv === 'development' ? err.message : 'Something went wrong. Please try again.',
    errorCode: 'SERVER_ERROR',
    statusCode: 500,
  });
};

module.exports = errorHandler;
