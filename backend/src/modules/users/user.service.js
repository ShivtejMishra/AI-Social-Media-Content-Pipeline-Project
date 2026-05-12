const User = require('./user.model');
const { PLANS } = require('../../shared/constants/plans');

/**
 * Find user by ID (without sensitive fields)
 */
const findById = async (userId) => {
  return User.findById(userId);
};

/**
 * Find user by email (includes passwordHash for auth)
 */
const findByEmailWithPassword = async (email) => {
  return User.findOne({ email }).select('+passwordHash +refreshTokens');
};

/**
 * Check if user has exceeded their usage limit for a given resource
 */
const checkUsageLimit = async (userId, resourceType) => {
  const user = await User.findById(userId);
  if (!user) return false;

  const plan = PLANS[user.plan];
  if (!plan) return false;

  const limit = plan.limits[resourceType];
  if (limit === Infinity) return true;

  // Reset monthly usage if needed
  const now = new Date();
  const resetAt = new Date(user.usage.resetAt);
  const monthsElapsed =
    (now.getFullYear() - resetAt.getFullYear()) * 12 +
    (now.getMonth() - resetAt.getMonth());

  if (monthsElapsed >= 1) {
    await User.findByIdAndUpdate(userId, {
      'usage.textGenerations': 0,
      'usage.imageGenerations': 0,
      'usage.exports': 0,
      'usage.resetAt': now,
    });
    return true;
  }

  return user.usage[resourceType] < limit;
};

/**
 * Increment usage counter for a resource type
 */
const incrementUsage = async (userId, resourceType) => {
  return User.findByIdAndUpdate(
    userId,
    { $inc: { [`usage.${resourceType}`]: 1 } },
    { new: true }
  );
};

/**
 * Get user usage stats
 */
const getUsageStats = async (userId) => {
  const user = await User.findById(userId);
  if (!user) return null;

  const plan = PLANS[user.plan];
  return {
    plan: user.plan,
    usage: user.usage,
    limits: plan?.limits || {},
  };
};

module.exports = { findById, findByEmailWithPassword, checkUsageLimit, incrementUsage, getUsageStats };
