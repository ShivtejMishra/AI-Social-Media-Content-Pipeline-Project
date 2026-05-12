const mongoose = require('mongoose');
const { CONTENT_STATUS } = require('../../shared/constants/platforms');

const contentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    workspaceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Workspace',
      required: true,
      index: true,
    },
    platform: {
      type: String,
      required: true,
      enum: ['instagram', 'linkedin', 'twitter', 'facebook', 'youtube_shorts', 'general'],
    },
    contentType: {
      type: String,
      required: true,
      enum: ['caption', 'post', 'thread', 'hashtags', 'carousel', 'short_copy', 'campaign_ideas', 'reel_script'],
    },
    title: {
      type: String,
      trim: true,
      default: 'Untitled Content',
    },
    prompt: {
      type: String, // The final user prompt sent to Gemini
      required: true,
    },
    systemPromptVersion: {
      type: String,
      default: '1.0',
    },
    input: {
      type: mongoose.Schema.Types.Mixed, // Original form data
      default: {},
    },
    output: {
      type: mongoose.Schema.Types.Mixed, // Full Gemini JSON response
      required: true,
    },
    editedOutput: {
      type: mongoose.Schema.Types.Mixed, // User-edited version
      default: null,
    },
    status: {
      type: String,
      enum: Object.values(CONTENT_STATUS),
      default: CONTENT_STATUS.DRAFT,
    },
    version: {
      type: Number,
      default: 1,
    },
    parentContentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Content',
      default: null,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    approvedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        if (ret.isDeleted) return null;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Compound indexes for common queries
contentSchema.index({ workspaceId: 1, platform: 1, status: 1 });
contentSchema.index({ userId: 1, createdAt: -1 });
contentSchema.index({ workspaceId: 1, isDeleted: 1 });

const Content = mongoose.model('Content', contentSchema);
module.exports = Content;
