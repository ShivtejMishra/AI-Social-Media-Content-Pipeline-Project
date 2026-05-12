const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../users/user.model');
const { findByEmailWithPassword } = require('../users/user.service');
const AppError = require('../../shared/errors/AppError');
const { jwt: jwtConfig } = require('../../config/env');

const SALT_ROUNDS = 10;

/**
 * Generate a JWT access token
 */
const generateAccessToken = (userId) => {
  return jwt.sign({ userId, type: 'access' }, jwtConfig.accessSecret, {
    expiresIn: jwtConfig.accessExpiresIn,
  });
};

/**
 * Generate a JWT refresh token
 */
const generateRefreshToken = (userId) => {
  return jwt.sign({ userId, type: 'refresh' }, jwtConfig.refreshSecret, {
    expiresIn: jwtConfig.refreshExpiresIn,
  });
};

/**
 * Register a new user
 */
const signup = async ({ name, email, password }) => {
  // Check if email already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw AppError.conflict('An account with this email already exists', 'EMAIL_EXISTS');
  }

  // Hash password
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  // Create user
  const user = await User.create({ name, email, passwordHash });

  // Generate tokens
  const accessToken = generateAccessToken(user._id.toString());
  const refreshToken = generateRefreshToken(user._id.toString());

  // Store refresh token
  await User.findByIdAndUpdate(user._id, {
    $push: { refreshTokens: refreshToken },
    lastLoginAt: new Date(),
  });

  return { user, accessToken, refreshToken };
};

/**
 * Authenticate a user
 */
const login = async ({ email, password }) => {
  const user = await findByEmailWithPassword(email);
  if (!user) {
    throw AppError.unauthorized('No account found with this email address.', 'USER_NOT_FOUND');
  }

  if (!user.isActive) {
    throw AppError.unauthorized('Account has been deactivated', 'ACCOUNT_DEACTIVATED');
  }

  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
  if (!isPasswordValid) {
    throw AppError.unauthorized('Incorrect password. Please try again.', 'WRONG_PASSWORD');
  }

  const accessToken = generateAccessToken(user._id.toString());
  const refreshToken = generateRefreshToken(user._id.toString());

  // Store refresh token (limit to 5 active sessions)
  const currentTokens = user.refreshTokens || [];
  const updatedTokens = [...currentTokens.slice(-4), refreshToken];

  await User.findByIdAndUpdate(user._id, {
    refreshTokens: updatedTokens,
    lastLoginAt: new Date(),
  });

  // Return user without sensitive fields
  const safeUser = await User.findById(user._id);
  return { user: safeUser, accessToken, refreshToken };
};

/**
 * Logout user - invalidate refresh token
 */
const logout = async (userId, refreshToken) => {
  await User.findByIdAndUpdate(userId, {
    $pull: { refreshTokens: refreshToken },
  });
};

/**
 * Refresh access token using refresh token
 */
const refreshAccessToken = async (incomingRefreshToken) => {
  let decoded;
  try {
    decoded = jwt.verify(incomingRefreshToken, jwtConfig.refreshSecret);
  } catch {
    throw AppError.unauthorized('Invalid or expired refresh token', 'INVALID_REFRESH_TOKEN');
  }

  if (decoded.type !== 'refresh') {
    throw AppError.unauthorized('Invalid token type', 'INVALID_TOKEN_TYPE');
  }

  const user = await User.findById(decoded.userId).select('+refreshTokens');
  if (!user || !user.refreshTokens.includes(incomingRefreshToken)) {
    throw AppError.unauthorized('Refresh token not found or already used', 'REFRESH_TOKEN_REUSE');
  }

  // Rotate refresh token (security best practice)
  const newAccessToken = generateAccessToken(user._id.toString());
  const newRefreshToken = generateRefreshToken(user._id.toString());

  const updatedTokens = user.refreshTokens
    .filter((t) => t !== incomingRefreshToken)
    .concat(newRefreshToken);

  await User.findByIdAndUpdate(user._id, { refreshTokens: updatedTokens });

  return { accessToken: newAccessToken, refreshToken: newRefreshToken };
};

/**
 * Verify access token and return user
 */
const verifyAccessToken = async (token) => {
  let decoded;
  try {
    decoded = jwt.verify(token, jwtConfig.accessSecret);
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      throw AppError.unauthorized('Access token has expired', 'TOKEN_EXPIRED');
    }
    throw AppError.unauthorized('Invalid access token', 'INVALID_TOKEN');
  }

  if (decoded.type !== 'access') {
    throw AppError.unauthorized('Invalid token type', 'INVALID_TOKEN_TYPE');
  }

  const user = await User.findById(decoded.userId);
  if (!user || !user.isActive) {
    throw AppError.unauthorized('User not found or deactivated', 'USER_NOT_FOUND');
  }

  return user;
};

module.exports = { signup, login, logout, refreshAccessToken, verifyAccessToken, generateAccessToken, generateRefreshToken };
