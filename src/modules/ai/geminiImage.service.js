const { GoogleGenAI } = require('@google/genai');
const AppError = require('../../shared/errors/AppError');

const getImageAI = () => {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_CLOUD_API_KEY;
  if (!apiKey) throw new Error('Missing API key for image generation (set GEMINI_API_KEY in .env)');
  return new GoogleGenAI({ apiKey });
};

/**
 * Generate an image using gemini-3.1-flash-image-preview
 * Returns array of { base64, mimeType }
 */
const generateImage = async (imagePrompt, options = {}) => {
  const { aspectRatio = '1:1' } = options;

  const ai = getImageAI();

  const request = {
    model: 'gemini-3.1-flash-image-preview',
    contents: [
      {
        role: 'user',
        parts: [{ text: imagePrompt }],
      },
    ],
    config: {
      systemInstruction: 'You are an image generation model. Generate ONLY what the user describes in their prompt. Do NOT add, invent, or change any elements. Follow the prompt exactly and literally. Do not use your own creative interpretation.',
      responseModalities: ['TEXT', 'IMAGE'],
      temperature: 0.4,
      topP: 0.85,
      safetySettings: [
        { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'OFF' },
        { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'OFF' },
        { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'OFF' },
        { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'OFF' },
      ],
    },
  };

  try {
    const response = await ai.models.generateContent(request);

    const images = [];
    const parts = response.candidates?.[0]?.content?.parts || [];

    for (const part of parts) {
      if (part.inlineData?.data) {
        images.push({
          base64: part.inlineData.data,
          mimeType: part.inlineData.mimeType || 'image/jpeg',
        });
      }
    }

    if (images.length === 0) {
      const textParts = parts.filter(p => p.text).map(p => p.text).join(' ');
      console.warn('[ImageGen] No image in response. Text received:', textParts.slice(0, 200));
      throw new Error('No image data received — model returned text only');
    }

    return images;
  } catch (error) {
    const msg = error.message || '';

    if (msg.includes('SAFETY') || msg.includes('safety')) {
      throw AppError.badRequest('Image blocked by safety filters. Try a different prompt.', 'IMAGE_SAFETY_BLOCKED');
    }
    if (msg.includes('429') || msg.includes('QUOTA') || msg.includes('quota')) {
      throw AppError.badRequest('Image generation quota exceeded. Try again later.', 'IMAGE_QUOTA_EXCEEDED');
    }
    if (msg.includes('PERMISSION_DENIED') || msg.includes('API_KEY_SERVICE_BLOCKED') || msg.includes('403')) {
      throw AppError.forbidden(
        'Image generation is blocked. Enable the Generative Language API on your GCP project.',
        'IMAGE_API_BLOCKED'
      );
    }
    if (msg.includes('not found') || msg.includes('404')) {
      throw AppError.badRequest('Image model not available for this API key.', 'IMAGE_MODEL_NOT_FOUND');
    }

    throw AppError.badRequest(`Image generation failed: ${msg}`, 'IMAGE_GENERATION_FAILED');
  }
};

/**
 * Convert base64 image to a data URI string for MongoDB storage.
 * No filesystem involved — works on Railway, Vercel, anywhere.
 */
const saveImageToMongo = (base64Data, mimeType = 'image/jpeg') => {
  return `data:${mimeType};base64,${base64Data}`;
};

// Keep old name as alias so existing imports don't break
const saveImageLocally = saveImageToMongo;

module.exports = { generateImage, saveImageToMongo, saveImageLocally };
