const mongoose = require('mongoose');

const workspaceSchema = new mongoose.Schema(
  {
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Workspace name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    brandName: {
      type: String,
      required: [true, 'Brand name is required'],
      trim: true,
      maxlength: [100, 'Brand name cannot exceed 100 characters'],
    },
    logoUrl: {
      type: String,
      default: '',
    },
    industry: {
      type: String,
      trim: true,
      maxlength: [100, 'Industry cannot exceed 100 characters'],
      default: '',
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
      default: '',
    },
    targetAudience: {
      type: String,
      trim: true,
      maxlength: [500, 'Target audience cannot exceed 500 characters'],
      default: '',
    },
    usp: {
      type: String,
      trim: true,
      maxlength: [500, 'USP cannot exceed 500 characters'],
      default: '',
    },
    brandTone: {
      type: String,
      trim: true,
      default: 'professional',
    },
    brandColors: {
      type: [String],
      default: [],
    },
    competitors: {
      type: [String],
      default: [],
    },
    website: {
      type: String,
      trim: true,
      default: '',
    },
    socialLinks: {
      instagram: { type: String, default: '' },
      linkedin: { type: String, default: '' },
      twitter: { type: String, default: '' },
      facebook: { type: String, default: '' },
      youtube: { type: String, default: '' },
    },
    guidelines: {
      type: String,
      maxlength: [2000, 'Guidelines cannot exceed 2000 characters'],
      default: '',
    },
    members: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        role: { type: String, enum: ['admin', 'editor', 'viewer'], default: 'viewer' },
        addedAt: { type: Date, default: Date.now },
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual: member count
workspaceSchema.virtual('memberCount').get(function () {
  return (this.members?.length || 0) + 1; // +1 for owner
});

workspaceSchema.index({ ownerId: 1, createdAt: -1 });

const Workspace = mongoose.model('Workspace', workspaceSchema);
module.exports = Workspace;
