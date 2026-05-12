const mongoose = require('mongoose');

const imageAssetSchema = new mongoose.Schema(
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
    contentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Content',
      default: null,
    },
    prompt: {
      type: String,
      required: true,
    },
    negativePrompt: {
      type: String,
      default: '',
    },
    imageUrl: {
      type: String,
      default: null,
    },
    // Base64 data URI for locally generated images
    imageData: {
      type: String,
      default: null,
      select: false, // Don't return base64 in list queries
    },
    provider: {
      type: String,
      enum: ['imagen', 'gemini', 'local'],
      default: 'imagen',
    },
    aspectRatio: {
      type: String,
      enum: ['1:1', '4:5', '16:9', '9:16'],
      default: '1:1',
    },
    platform: {
      type: String,
      default: 'instagram',
    },
    visualStyle: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['pending', 'generating', 'completed', 'failed'],
      default: 'pending',
    },
    errorMessage: {
      type: String,
      default: null,
    },
    input: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    generationMetadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

imageAssetSchema.index({ workspaceId: 1, createdAt: -1 });
imageAssetSchema.index({ userId: 1, status: 1 });

const ImageAsset = mongoose.model('ImageAsset', imageAssetSchema);
module.exports = ImageAsset;
