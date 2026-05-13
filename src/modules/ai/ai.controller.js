const asyncHandler = require('../../shared/utils/asyncHandler');
const { sendSuccess, sendCreated } = require('../../shared/utils/apiResponse');
const aiService = require('./ai.service');
const ImageAsset = require('./imageAsset.model');
const { CONTENT_SYSTEM_PROMPT } = require('./prompt.service');
const { streamText } = require('./geminiText.service');
const { buildContentUserPrompt } = require('./prompt.service');
const { verifyWorkspaceAccess } = require('./ai.service');
const Workspace = require('../workspaces/workspace.model');
const AppError = require('../../shared/errors/AppError');
const { generateImage: generateGeminiImage, saveImageLocally } = require('./geminiImage.service');

/**
 * POST /api/ai/generate-content
 */
const generateContent = asyncHandler(async (req, res) => {
  const content = await aiService.generateContent(req.user._id, req.body);

  return sendCreated(res, {
    message: 'Content generated successfully',
    data: { content },
  });
});

/**
 * POST /api/ai/regenerate-content
 */
const regenerateContent = asyncHandler(async (req, res) => {
  const { contentId, ...overrides } = req.body;
  const content = await aiService.regenerateContent(req.user._id, contentId, overrides);

  return sendCreated(res, {
    message: 'Content regenerated successfully',
    data: { content },
  });
});

/**
 * POST /api/ai/generate-image
 */
const generateImage = asyncHandler(async (req, res) => {
  const imageAsset = await aiService.generateImageContent(req.user._id, req.body);

  return sendCreated(res, {
    message: 'Image generation completed',
    data: { imageAsset },
  });
});

/**
 * GET /api/images
 */
const getImages = asyncHandler(async (req, res) => {
  const { workspaceId, status, page = 1, limit = 20 } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const filter = { userId: req.user._id };
  if (workspaceId) filter.workspaceId = workspaceId;
  if (status) filter.status = status;

  const [images, total] = await Promise.all([
    ImageAsset.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('workspaceId', 'name brandName'),
    ImageAsset.countDocuments(filter),
  ]);

  return sendSuccess(res, {
    message: 'Images retrieved',
    data: { images },
    meta: { page: parseInt(page), limit: parseInt(limit), total, totalPages: Math.ceil(total / parseInt(limit)) },
  });
});

/**
 * GET /api/images/:id
 */
const getImageById = asyncHandler(async (req, res) => {
  const image = await ImageAsset.findById(req.params.id).select('+imageData');

  if (!image) throw AppError.notFound('Image not found', 'IMAGE_NOT_FOUND');
  if (image.userId.toString() !== req.user._id.toString()) {
    throw AppError.forbidden('Access denied', 'IMAGE_ACCESS_DENIED');
  }

  return sendSuccess(res, { message: 'Image retrieved', data: { image } });
});

/**
 * DELETE /api/images/:id
 */
const deleteImage = asyncHandler(async (req, res) => {
  const image = await ImageAsset.findById(req.params.id);
  if (!image) throw AppError.notFound('Image not found', 'IMAGE_NOT_FOUND');
  if (image.userId.toString() !== req.user._id.toString()) {
    throw AppError.forbidden('Access denied', 'IMAGE_ACCESS_DENIED');
  }

  await ImageAsset.findByIdAndDelete(req.params.id);
  return sendSuccess(res, { message: 'Image deleted', data: {} });
});

/**
 * POST /api/ai/stream-content - Server-Sent Events streaming
 */
const streamContent = asyncHandler(async (req, res) => {
  const { workspaceId, platform, contentType, tone, campaignTheme, offer, cta, language } = req.body;

  const workspace = await verifyWorkspaceAccess(workspaceId, req.user._id);

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  const contentRequest = { platform, contentType, tone, campaignTheme, offer, cta, language, variations: 1 };
  const userPrompt = buildContentUserPrompt(workspace, contentRequest);

  try {
    await streamText(
      CONTENT_SYSTEM_PROMPT,
      userPrompt,
      (chunk) => {
        res.write(`data: ${JSON.stringify({ chunk })}\n\n`);
      }
    );
    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
  } catch (error) {
    res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
  } finally {
    res.end();
  }
});

/**
 * POST /api/ai/generate-thumbnail
 * Uses Nano Banana — gemini-3.1-flash-image-preview (BETA)
 */
const generateThumbnail = asyncHandler(async (req, res) => {
  const { workspaceId, videoTitle, videoTopic, style, textOverlay, mood, colorScheme, additionalInstructions } = req.body;

  const workspace = await verifyWorkspaceAccess(workspaceId, req.user._id);

  // Build the image prompt directly from user inputs — no AI rewriting
  const parts = [
    `YouTube thumbnail (16:9 aspect ratio).`,
    `Video: "${videoTitle}".`,
    videoTopic ? `Topic: ${videoTopic}.` : '',
    `Visual style: ${style}.`,
    `Mood: ${mood}.`,
    colorScheme ? `Color scheme: ${colorScheme}.` : '',
    textOverlay ? `Include this text visibly in the image: "${textOverlay}".` : '',
    additionalInstructions ? additionalInstructions : '',
  ].filter(Boolean).join(' ');

  const imagePrompt = parts;

  // Step 2: Generate image with gemini-3.1-flash-image-preview
  let savedAsset;
  try {
    const images = await generateGeminiImage(imagePrompt, { aspectRatio: '16:9' });
    const { base64, mimeType } = images[0];

    // Store as base64 data URI in MongoDB — no disk needed
    const imageData = `data:${mimeType};base64,${base64}`;
    const imageUrl = `/api/ai/images/{{id}}/data`; // placeholder, updated below

    savedAsset = await ImageAsset.create({
      userId:      req.user._id,
      workspaceId,
      prompt:      imagePrompt,
      imageData,
      aspectRatio: '16:9',
      platform:    'youtube',
      status:      'completed',
    });
    // Update imageUrl with real ID
    await ImageAsset.findByIdAndUpdate(savedAsset._id, {
      imageUrl: `/api/ai/images/${savedAsset._id}/data`,
    });
  } catch (err) {
    console.error('[Thumbnail] Generation failed:', err.message);
    savedAsset = await ImageAsset.create({
      userId: req.user._id, workspaceId,
      prompt: imagePrompt, aspectRatio: '16:9', platform: 'youtube',
      status: 'failed', errorMessage: err.message, model: 'nano-banana',
    });
  }

  return sendCreated(res, { message: 'Thumbnail generated!', data: { image: savedAsset } });
});

/**
 * GET /api/ai/images/:id/data
 * Serve the raw image bytes stored in MongoDB as a proper image response
 */
const serveImageData = asyncHandler(async (req, res) => {
  const asset = await ImageAsset.findById(req.params.id).select('+imageData');
  if (!asset) throw AppError.notFound('Image not found');
  if (!asset.imageData) throw AppError.notFound('Image data not available');

  // Parse the data URI: "data:image/jpeg;base64,/9j/4AAQ..."
  const matches = asset.imageData.match(/^data:(.+);base64,(.+)$/);
  if (!matches) throw AppError.badRequest('Invalid image data format');

  const mimeType = matches[1];
  const buffer = Buffer.from(matches[2], 'base64');

  res.set('Content-Type', mimeType);
  res.set('Cache-Control', 'public, max-age=86400'); // cache 24h
  res.set('Content-Length', buffer.length);
  return res.send(buffer);
});

module.exports = { generateContent, regenerateContent, generateImage, getImages, getImageById, deleteImage, streamContent, generateThumbnail, serveImageData };
