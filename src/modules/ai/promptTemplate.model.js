const mongoose = require('mongoose');

const promptTemplateSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    type: {
      type: String,
      required: true,
      enum: ['text', 'image', 'campaign', 'reel_script'],
    },
    platform: {
      type: String,
      enum: ['instagram', 'linkedin', 'twitter', 'facebook', 'youtube_shorts', 'general', 'all'],
      default: 'all',
    },
    contentType: {
      type: String,
      default: 'all',
    },
    systemPrompt: {
      type: String,
      required: true,
    },
    userPromptTemplate: {
      type: String,
      required: true,
    },
    variables: {
      type: [String], // List of {{variable}} placeholders used
      default: [],
    },
    version: {
      type: String,
      default: '1.0',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

promptTemplateSchema.index({ type: 1, isActive: 1 });
promptTemplateSchema.index({ platform: 1, isActive: 1 });

const PromptTemplate = mongoose.model('PromptTemplate', promptTemplateSchema);
module.exports = PromptTemplate;
