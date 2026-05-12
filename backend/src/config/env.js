const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const requiredEnvVars = [
  'PORT',
  'MONGO_URI',
  'JWT_ACCESS_SECRET',
  'JWT_REFRESH_SECRET',
  'GEMINI_API_KEY',
  'GOOGLE_CLOUD_API_KEY',
];

requiredEnvVars.forEach((varName) => {
  if (!process.env[varName]) {
    console.warn(`⚠️  Warning: Environment variable ${varName} is not set.`);
  }
});

module.exports = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/socialxstudio',
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET || 'fallback_access_secret_change_in_production',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'fallback_refresh_secret_change_in_production',
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },
  gemini: {
    apiKey: process.env.GEMINI_API_KEY || '',
    textModel: process.env.GEMINI_TEXT_MODEL || 'gemini-2.5-flash',
    imageModel: process.env.GEMINI_IMAGE_MODEL || 'gemini-3.1-flash-image-preview',
    imageApiKey: process.env.GOOGLE_CLOUD_API_KEY || process.env.GEMINI_API_KEY || '',
  },
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
  },
  storage: {
    provider: process.env.STORAGE_PROVIDER || 'local',
    uploadDir: process.env.UPLOAD_DIR || 'uploads',
  },
};
