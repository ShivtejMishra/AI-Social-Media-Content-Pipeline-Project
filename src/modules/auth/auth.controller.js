const asyncHandler = require('../../shared/utils/asyncHandler');
const { sendSuccess, sendCreated } = require('../../shared/utils/apiResponse');
const authService = require('./auth.service');
const User = require('../users/user.model');
const AppError = require('../../shared/errors/AppError');
const { sendVerificationEmail } = require('../../services/email.service');

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

/** Generate a random 6-digit OTP */
const generateOtp = () => String(Math.floor(100000 + Math.random() * 900000));

/** Save OTP to DB and send email — shared by signup and resend */
const sendOtpEmail = async (userId, email, name) => {
  const otp = generateOtp();
  const expires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

  await User.findByIdAndUpdate(userId, {
    emailVerificationOtp: otp,
    emailVerificationOtpExpires: expires,
  });

  await sendVerificationEmail({ to: email, name, otp });
};

/**
 * POST /api/auth/signup
 */
const signup = asyncHandler(async (req, res) => {
  const { user, accessToken, refreshToken } = await authService.signup(req.body);

  res.cookie('refreshToken', refreshToken, COOKIE_OPTIONS);

  // Auto-send OTP (non-fatal)
  try {
    await sendOtpEmail(user._id, user.email, user.name);
  } catch (err) {
    console.warn('⚠️  OTP email failed to send:', err.message);
  }

  return sendCreated(res, {
    message: 'Account created! Check your email for the 6-digit verification code.',
    data: { user, accessToken },
  });
});

/**
 * POST /api/auth/login
 */
const login = asyncHandler(async (req, res) => {
  const { user, accessToken, refreshToken } = await authService.login(req.body);

  res.cookie('refreshToken', refreshToken, COOKIE_OPTIONS);

  return sendSuccess(res, {
    message: 'Logged in successfully',
    data: { user, accessToken },
  });
});

/**
 * POST /api/auth/logout
 */
const logout = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;

  if (refreshToken && req.user) {
    await authService.logout(req.user._id.toString(), refreshToken);
  }

  res.clearCookie('refreshToken');
  return sendSuccess(res, { message: 'Logged out successfully', data: {} });
});

/**
 * POST /api/auth/refresh-token
 */
const refreshToken = asyncHandler(async (req, res) => {
  const incomingToken = req.cookies?.refreshToken || req.body?.refreshToken;

  const { accessToken, refreshToken: newRefreshToken } = await authService.refreshAccessToken(incomingToken);

  res.cookie('refreshToken', newRefreshToken, COOKIE_OPTIONS);

  return sendSuccess(res, {
    message: 'Token refreshed successfully',
    data: { accessToken },
  });
});

/**
 * GET /api/auth/me
 */
const getMe = asyncHandler(async (req, res) => {
  return sendSuccess(res, {
    message: 'User profile retrieved',
    data: { user: req.user },
  });
});

/**
 * POST /api/auth/send-verification
 * (Re)send OTP — for unverified users
 */
const sendVerification = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) throw AppError.notFound('User not found');
  if (user.isEmailVerified) throw AppError.badRequest('Email is already verified');

  await sendOtpEmail(user._id, user.email, user.name);

  return sendSuccess(res, { message: 'Verification code sent! Check your inbox.', data: {} });
});

/**
 * POST /api/auth/verify-otp
 * Verify the 6-digit OTP entered by the user
 */
const verifyOtp = asyncHandler(async (req, res) => {
  const { otp } = req.body;
  if (!otp) throw AppError.badRequest('OTP code is required');

  const user = await User.findById(req.user._id)
    .select('+emailVerificationOtp +emailVerificationOtpExpires');

  if (!user) throw AppError.notFound('User not found');
  if (user.isEmailVerified) throw AppError.badRequest('Email is already verified');

  if (!user.emailVerificationOtp) {
    throw AppError.badRequest('No verification code found. Please request a new one.');
  }

  if (new Date(user.emailVerificationOtpExpires) < new Date()) {
    throw AppError.badRequest('Code has expired. Please request a new one.');
  }

  if (user.emailVerificationOtp !== String(otp).trim()) {
    throw AppError.badRequest('Incorrect code. Please check your email and try again.');
  }

  await User.findByIdAndUpdate(user._id, {
    isEmailVerified: true,
    emailVerificationOtp: null,
    emailVerificationOtpExpires: null,
  });

  return sendSuccess(res, { message: 'Email verified successfully! 🎉', data: {} });
});

module.exports = { signup, login, logout, refreshToken, getMe, sendVerification, verifyOtp };
