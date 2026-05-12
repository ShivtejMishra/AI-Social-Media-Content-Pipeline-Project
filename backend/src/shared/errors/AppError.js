/**
 * Custom Application Error class
 * Extends native Error with HTTP status and error codes
 */
class AppError extends Error {
  constructor(message, statusCode = 500, errorCode = 'SERVER_ERROR') {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.isOperational = true; // Distinguishes known errors from unexpected ones
    Error.captureStackTrace(this, this.constructor);
  }
}

// Pre-defined factory methods for common errors
AppError.badRequest = (message, errorCode = 'BAD_REQUEST') =>
  new AppError(message, 400, errorCode);

AppError.unauthorized = (message = 'Authentication required', errorCode = 'AUTH_REQUIRED') =>
  new AppError(message, 401, errorCode);

AppError.forbidden = (message = 'Access denied', errorCode = 'FORBIDDEN') =>
  new AppError(message, 403, errorCode);

AppError.notFound = (message, errorCode = 'NOT_FOUND') =>
  new AppError(message, 404, errorCode);

AppError.conflict = (message, errorCode = 'CONFLICT') =>
  new AppError(message, 409, errorCode);

AppError.tooManyRequests = (message = 'Too many requests', errorCode = 'RATE_LIMITED') =>
  new AppError(message, 429, errorCode);

AppError.internal = (message = 'Internal server error', errorCode = 'SERVER_ERROR') =>
  new AppError(message, 500, errorCode);

AppError.aiError = (message = 'AI generation failed', errorCode = 'AI_GENERATION_FAILED') =>
  new AppError(message, 502, errorCode);

module.exports = AppError;
