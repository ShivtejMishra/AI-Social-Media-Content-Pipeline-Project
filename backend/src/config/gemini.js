const { GoogleGenAI } = require('@google/genai');
const { gemini } = require('./env');

let genAIInstance = null;

const getGenAI = () => {
  if (!genAIInstance) {
    if (!gemini.apiKey) {
      throw new Error('GEMINI_API_KEY is not configured');
    }
    genAIInstance = new GoogleGenAI({ apiKey: gemini.apiKey });
  }
  return genAIInstance;
};

module.exports = { getGenAI, geminiConfig: gemini };
