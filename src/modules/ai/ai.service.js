const Workspace = require('../workspaces/workspace.model');
const Content = require('../content/content.model');
const ImageAsset = require('./imageAsset.model');
const { checkUsageLimit, incrementUsage } = require('../users/user.service');
const { buildContentUserPrompt, CONTENT_SYSTEM_PROMPT, SYSTEM_PROMPT_VERSION } = require('./prompt.service');
const { generateText } = require('./geminiText.service');
const { generateImage, saveImageLocally } = require('./geminiImage.service');
const { validateRequestInputs, sanitizeInput } = require('./safety.service');
const AppError = require('../../shared/errors/AppError');

/**
 * Verify workspace ownership/access
 */
const verifyWorkspaceAccess = async (workspaceId, userId) => {
  const workspace = await Workspace.findById(workspaceId);

  if (!workspace || !workspace.isActive) {
    throw AppError.notFound('Workspace not found', 'WORKSPACE_NOT_FOUND');
  }

  const isOwner = workspace.ownerId.toString() === userId.toString();
  const isMember = workspace.members.some((m) => m.userId.toString() === userId.toString());

  if (!isOwner && !isMember) {
    throw AppError.forbidden('You do not have access to this workspace', 'WORKSPACE_ACCESS_DENIED');
  }

  return workspace;
};

/**
 * Generate social media text content
 */
const generateContent = async (userId, requestData) => {
  const { workspaceId, platform, contentType, tone, campaignTheme, offer, cta, language, variations, goal } = requestData;

  // Safety checks on user inputs
  const safetyIssues = validateRequestInputs({ campaignTheme, offer, cta });
  if (safetyIssues.length > 0) {
    throw AppError.badRequest('Input contains potentially unsafe content', 'SAFETY_VIOLATION');
  }

  // Verify workspace access
  const workspace = await verifyWorkspaceAccess(workspaceId, userId);

  // Check usage limits
  const hasLimit = await checkUsageLimit(userId, 'textGenerations');
  if (!hasLimit) {
    throw AppError.badRequest('Monthly text generation limit reached. Please upgrade your plan.', 'USAGE_LIMIT_EXCEEDED');
  }

  // Build prompts
  const contentRequest = {
    platform,
    contentType,
    tone,
    campaignTheme: sanitizeInput(campaignTheme),
    offer: sanitizeInput(offer),
    cta: sanitizeInput(cta),
    language,
    variations,
    goal,
  };

  const userPrompt = buildContentUserPrompt(workspace, contentRequest);

  // Call Gemini
  const aiResponse = await generateText(CONTENT_SYSTEM_PROMPT, userPrompt, { temperature: 0.85 });

  // Increment usage counter
  await incrementUsage(userId, 'textGenerations');

  // Save to database
  const content = await Content.create({
    userId,
    workspaceId,
    platform,
    contentType,
    title: aiResponse.title || `${platform} ${contentType} - ${new Date().toLocaleDateString()}`,
    prompt: userPrompt,
    systemPromptVersion: SYSTEM_PROMPT_VERSION,
    input: contentRequest,
    output: aiResponse,
    status: 'draft',
  });

  return content;
};

/**
 * Regenerate content (creates new version linked to parent)
 */
const regenerateContent = async (userId, contentId, overrides = {}) => {
  const originalContent = await Content.findById(contentId);
  if (!originalContent) {
    throw AppError.notFound('Content not found', 'CONTENT_NOT_FOUND');
  }

  if (originalContent.userId.toString() !== userId.toString()) {
    throw AppError.forbidden('Access denied', 'CONTENT_ACCESS_DENIED');
  }

  const workspace = await verifyWorkspaceAccess(originalContent.workspaceId, userId);

  const hasLimit = await checkUsageLimit(userId, 'textGenerations');
  if (!hasLimit) {
    throw AppError.badRequest('Monthly text generation limit reached', 'USAGE_LIMIT_EXCEEDED');
  }

  const contentRequest = { ...originalContent.input, ...overrides };
  const userPrompt = buildContentUserPrompt(workspace, contentRequest);
  const aiResponse = await generateText(CONTENT_SYSTEM_PROMPT, userPrompt, { temperature: 0.9 });

  await incrementUsage(userId, 'textGenerations');

  const newContent = await Content.create({
    userId,
    workspaceId: originalContent.workspaceId,
    platform: originalContent.platform,
    contentType: originalContent.contentType,
    title: `${originalContent.title} (Regenerated)`,
    prompt: userPrompt,
    systemPromptVersion: SYSTEM_PROMPT_VERSION,
    input: contentRequest,
    output: aiResponse,
    status: 'draft',
    version: (originalContent.version || 1) + 1,
    parentContentId: originalContent._id,
  });

  return newContent;
};

/**
 * Generate an image for social media
 */
const generateImageContent = async (userId, requestData) => {
  const { workspaceId, platform, mainMessage, campaignTheme, aspectRatio, visualStyle,
    mood, subject, colorPreference, additionalInstructions, contentId } = requestData;

  const workspace = await verifyWorkspaceAccess(workspaceId, userId);

  const hasLimit = await checkUsageLimit(userId, 'imageGenerations');
  if (!hasLimit) {
    throw AppError.badRequest('Monthly image generation limit reached. Please upgrade your plan.', 'USAGE_LIMIT_EXCEEDED');
  }

  // Safety checks
  const safetyIssues = validateRequestInputs({ mainMessage, campaignTheme, additionalInstructions });
  if (safetyIssues.length > 0) {
    throw AppError.badRequest('Input contains potentially unsafe content', 'SAFETY_VIOLATION');
  }

  // Build the final image prompt DIRECTLY from user inputs — no AI rewriting
  const promptParts = [
    sanitizeInput(mainMessage),
    subject           ? `Subject: ${sanitizeInput(subject)}.`           : '',
    visualStyle       ? `Style: ${visualStyle}.`                         : '',
    mood              ? `Mood: ${mood}.`                                 : '',
    colorPreference   ? `Color palette: ${colorPreference}.`             : '',
    campaignTheme     ? `Campaign theme: ${sanitizeInput(campaignTheme)}.` : '',
    platform          ? `Platform: ${platform}. Aspect ratio: ${aspectRatio}.` : '',
    additionalInstructions ? sanitizeInput(additionalInstructions)       : '',
  ].filter(Boolean).join(' ');

  const finalImagePrompt = promptParts;

  // Create the image asset record immediately (so UI can show "generating" state)
  const imageAsset = await ImageAsset.create({
    userId,
    workspaceId,
    contentId: contentId || null,
    prompt: finalImagePrompt,
    aspectRatio,
    platform,
    visualStyle,
    status: 'generating',
    input: requestData,
  });

  // Generate actual image
  try {
    const images = await generateImage(finalImagePrompt, {
      aspectRatio,
      numberOfImages: 1,
    });

    if (images && images.length > 0) {
      // Store image as base64 data URI directly in MongoDB — no filesystem needed
      const imageData = saveImageLocally(images[0].base64, images[0].mimeType);
      const imageUrl = `/api/ai/images/${imageAsset._id}/data`;

      await ImageAsset.findByIdAndUpdate(imageAsset._id, {
        imageUrl,
        imageData,  // base64 data URI stored in MongoDB
        status: 'completed',
      });
    }
  } catch (imgError) {
    await ImageAsset.findByIdAndUpdate(imageAsset._id, {
      status: 'failed',
      errorMessage: imgError.message,
    });
  }

  await incrementUsage(userId, 'imageGenerations');

  const finalAsset = await ImageAsset.findById(imageAsset._id);
  return finalAsset;
};

module.exports = { generateContent, regenerateContent, generateImageContent, verifyWorkspaceAccess };
