const { getGenAI, geminiConfig } = require('../../config/gemini');
const AppError = require('../../shared/errors/AppError');

/**
 * Parse Gemini response text to JSON safely
 */
const parseGeminiJSON = (text) => {
  try {
    // Remove markdown code fences if present
    const cleaned = text
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/```\s*$/i, '')
      .trim();

    return JSON.parse(cleaned);
  } catch {
    // Try to extract JSON from the text
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0]);
      } catch {
        throw new Error('Could not parse AI response as JSON');
      }
    }
    throw new Error('No valid JSON found in AI response');
  }
};

/**
 * Generate text content using Gemini text model
 * @param {string} systemPrompt - System instruction
 * @param {string} userPrompt - User message/context
 * @param {object} options - Additional options
 */
const generateText = async (systemPrompt, userPrompt, options = {}) => {
  const genAI = getGenAI();
  const { temperature = 0.8, maxOutputTokens = 8192 } = options;

  try {
    const response = await genAI.models.generateContent({
      model: geminiConfig.textModel,
      config: {
        systemInstruction: systemPrompt,
        temperature,
        maxOutputTokens,
        responseMimeType: 'application/json',
      },
      contents: [
        {
          role: 'user',
          parts: [{ text: userPrompt }],
        },
      ],
    });

    const text = response.text;
    if (!text) {
      throw new Error('Gemini returned empty response');
    }

    return parseGeminiJSON(text);
  } catch (error) {
    if (error.message?.includes('SAFETY')) {
      throw AppError.badRequest('Content was blocked by safety filters. Please adjust your input.', 'CONTENT_SAFETY_BLOCKED');
    }
    if (error.message?.includes('QUOTA') || error.message?.includes('429')) {
      throw AppError.tooManyRequests('Gemini API quota exceeded. Please try again later.', 'AI_QUOTA_EXCEEDED');
    }
    if (error.message?.includes('API key')) {
      throw AppError.internal('AI service configuration error', 'AI_CONFIG_ERROR');
    }
    if (error.message?.includes('Could not parse') || error.message?.includes('No valid JSON')) {
      throw AppError.aiError(`AI returned invalid JSON: ${error.message}`, 'AI_PARSE_ERROR');
    }
    throw AppError.aiError(`Text generation failed: ${error.message}`, 'AI_GENERATION_FAILED');
  }
};

/**
 * Stream text content using Gemini (for SSE streaming)
 */
const streamText = async (systemPrompt, userPrompt, onChunk, options = {}) => {
  const genAI = getGenAI();
  const { temperature = 0.8 } = options;

  try {
    const response = await genAI.models.generateContentStream({
      model: geminiConfig.textModel,
      config: {
        systemInstruction: systemPrompt,
        temperature,
      },
      contents: [
        {
          role: 'user',
          parts: [{ text: userPrompt }],
        },
      ],
    });

    let fullText = '';
    for await (const chunk of response) {
      const chunkText = chunk.text || '';
      fullText += chunkText;
      if (onChunk) onChunk(chunkText);
    }

    return fullText;
  } catch (error) {
    throw AppError.aiError(`Streaming generation failed: ${error.message}`, 'AI_STREAM_FAILED');
  }
};

module.exports = { generateText, streamText, parseGeminiJSON };
