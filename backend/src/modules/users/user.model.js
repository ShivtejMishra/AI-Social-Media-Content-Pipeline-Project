const mongoose = require('mongoose');
const { DEFAULT_PLAN } = require('../../shared/constants/plans');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    },
    passwordHash: {
      type: String,
      required: [true, 'Password is required'],
      select: false, // Never return password by default
    },
    avatar: {
      type: String,
      default: null,
    },
    bio: {
      type: String,
      maxlength: [500, 'Bio cannot exceed 500 characters'],
      default: '',
    },
    website: {
      type: String,
      default: '',
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    plan: {
      type: String,
      enum: ['free', 'pro', 'agency'],
      default: DEFAULT_PLAN,
    },
    usage: {
      textGenerations: { type: Number, default: 0 },
      imageGenerations: { type: Number, default: 0 },
      exports: { type: Number, default: 0 },
      resetAt: { type: Date, default: () => new Date() },
    },
    refreshTokens: {
      type: [String],
      select: false,
      default: [],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    emailVerificationOtp: {
      type: String,
      default: null,
      select: false,
    },
    emailVerificationOtpExpires: {
      type: Date,
      default: null,
      select: false,
    },
    lastLoginAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        delete ret.passwordHash;
        delete ret.refreshTokens;
        delete ret.__v;
        return ret;
      },
    },
  }
);

const User = mongoose.model('User', userSchema);
module.exports = User;
