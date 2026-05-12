const { verifyAccessToken } = require('./auth.service');
const AppError = require('../../shared/errors/AppError');

/**
 * Protect routes - requires valid JWT access token
 */
const protect = async (req, res, next) => {
  try {
    let token;

    // Check Authorization header (Bearer token)
    if (req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }
    // Also check httpOnly cookie as fallback
    else if (req.cookies?.accessToken) {
      token = req.cookies.accessToken;
    }

    if (!token) {
      throw AppError.unauthorized('Authentication required. Please login.', 'AUTH_REQUIRED');
    }

    const user = await verifyAccessToken(token);
    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Restrict to specific roles
 */
const restrictTo = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user?.role)) {
    return next(AppError.forbidden('You do not have permission to perform this action', 'INSUFFICIENT_ROLE'));
  }
  next();
};

/**
 * Optional auth - attaches user if token present, but doesn't block
 */
const optionalAuth = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies?.accessToken) {
      token = req.cookies.accessToken;
    }

    if (token) {
      const user = await verifyAccessToken(token);
      req.user = user;
    }
  } catch {
    // Silently ignore auth errors in optional mode
  }
  next();
};

module.exports = { protect, restrictTo, optionalAuth };
