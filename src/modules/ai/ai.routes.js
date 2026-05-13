const express = require('express');
const router = express.Router();
const aiController = require('./ai.controller');
const { protect } = require('../auth/auth.middleware');
const validate = require('../../shared/middlewares/validate');
const { z } = require('zod');

// Validation schemas
const generateContentSchema = z.object({
  workspaceId: z.string().min(1, 'Workspace ID is required'),
  platform: z.enum(['instagram', 'linkedin', 'twitter', 'facebook', 'youtube_shorts', 'general']),
  contentType: z.enum(['caption', 'post', 'thread', 'hashtags', 'carousel', 'short_copy', 'campaign_ideas', 'reel_script']),
  tone: z.string().min(1, 'Tone is required'),
  campaignTheme: z.string().optional().default(''),
  offer: z.string().optional().default(''),
  cta: z.string().optional().default(''),
  language: z.string().optional().default('English'),
  variations: z.number().int().min(1).max(5).optional().default(1),
  goal: z.string().optional().default('engagement'),
});

const generateImageSchema = z.object({
  workspaceId: z.string().min(1, 'Workspace ID is required'),
  platform: z.string().optional().default('instagram'),
  mainMessage: z.string().min(1, 'Main message is required').max(2000),
  campaignTheme: z.string().optional().default(''),
  aspectRatio: z.enum(['1:1', '4:5', '16:9', '9:16', 'auto']).optional().default('1:1'),
  visualStyle: z.string().optional().default('modern, clean, professional'),
  additionalInstructions: z.string().max(1000).optional().default(''),
  contentId: z.string().optional(),
});

// Public: serve image bytes from MongoDB (browser img tags can't send auth headers)
router.get('/images/:id/data', aiController.serveImageData);

// All AI routes require authentication
router.use(protect);

router.post('/generate-content', validate(generateContentSchema), aiController.generateContent);
router.post('/regenerate-content', aiController.regenerateContent);
router.post('/generate-image', (req, res, next) => {
  // Debug: log exactly what arrives so validation failures are visible in server logs
  if (!req.body.workspaceId) {
    console.warn('[AI] generate-image: missing workspaceId. Body keys:', Object.keys(req.body));
  }
  next();
}, validate(generateImageSchema), aiController.generateImage);
router.post('/stream-content', aiController.streamContent);

const generateThumbnailSchema = z.object({
  workspaceId: z.string().min(1, 'Workspace ID is required'),
  videoTitle:  z.string().min(1, 'Video title is required').max(200),
  videoTopic:  z.string().min(1, 'Video topic is required').max(500),
  style:       z.string().optional().default('eye-catching, high contrast, professional YouTube thumbnail'),
  textOverlay: z.string().optional().default(''),
  mood:        z.string().optional().default('exciting, engaging'),
  colorScheme: z.string().optional().default('bold, vibrant'),
  additionalInstructions: z.string().max(500).optional().default(''),
});

router.post('/generate-thumbnail', validate(generateThumbnailSchema), aiController.generateThumbnail);

// Image asset management
router.get('/images', aiController.getImages);
router.get('/images/:id', aiController.getImageById);
router.delete('/images/:id', aiController.deleteImage);

module.exports = router;
