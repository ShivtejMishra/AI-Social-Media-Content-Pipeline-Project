const User = require('./user.model');
const asyncHandler = require('../../shared/utils/asyncHandler');
const { sendSuccess } = require('../../shared/utils/apiResponse');
const AppError = require('../../shared/errors/AppError');
const bcrypt = require('bcryptjs');

/**
 * GET /api/users/profile
 */
const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) throw AppError.notFound('User not found');
  return sendSuccess(res, { message: 'Profile retrieved', data: { user } });
});

/**
 * PATCH /api/users/profile
 * Update name, bio, website (not email/password here)
 */
const updateProfile = asyncHandler(async (req, res) => {
  const { name, bio, website } = req.body;

  const updates = {};
  if (name?.trim()) updates.name = name.trim();
  if (bio !== undefined) updates.bio = bio.trim().slice(0, 500);
  if (website !== undefined) updates.website = website.trim();

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { $set: updates },
    { new: true, runValidators: true }
  );

  return sendSuccess(res, { message: 'Profile updated', data: { user } });
});

/**
 * PATCH /api/users/avatar
 * Upload + update user avatar
 */
const updateAvatar = asyncHandler(async (req, res) => {
  if (!req.file) throw AppError.badRequest('No image file provided');

  const avatarUrl = `/uploads/avatars/${req.file.filename}`;

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { $set: { avatar: avatarUrl } },
    { new: true }
  );

  return sendSuccess(res, { message: 'Avatar updated', data: { user, avatarUrl } });
});

/**
 * PATCH /api/users/password
 */
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    throw AppError.badRequest('Current and new password are required');
  }
  if (newPassword.length < 8) {
    throw AppError.badRequest('Password must be at least 8 characters');
  }

  const user = await User.findById(req.user._id).select('+passwordHash');
  const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!isMatch) throw AppError.unauthorized('Current password is incorrect');

  const newHash = await bcrypt.hash(newPassword, 10);
  await User.findByIdAndUpdate(req.user._id, { $set: { passwordHash: newHash } });

  return sendSuccess(res, { message: 'Password changed successfully', data: {} });
});

/**
 * DELETE /api/users/account
 * Permanently deletes the authenticated user's account
 */
const deleteAccount = asyncHandler(async (req, res) => {
  await User.findByIdAndDelete(req.user._id);

  // Clear the refresh-token cookie so the session ends
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  });

  return sendSuccess(res, { message: 'Account deleted successfully', data: {} });
});

module.exports = { getProfile, updateProfile, updateAvatar, changePassword, deleteAccount };
