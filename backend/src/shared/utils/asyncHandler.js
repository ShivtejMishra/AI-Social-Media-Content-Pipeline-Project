/**
 * Wraps async route handlers to automatically catch errors
 * Works with express-async-errors package as backup
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
