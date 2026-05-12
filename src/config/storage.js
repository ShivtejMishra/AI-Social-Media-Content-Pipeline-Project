const path = require('path');
const fs = require('fs');
const { storage } = require('./env');

const UPLOAD_DIR = path.resolve(process.cwd(), storage.uploadDir);

// Ensure upload directories exist
const initStorage = () => {
  const dirs = [
    UPLOAD_DIR,
    path.join(UPLOAD_DIR, 'images'),
    path.join(UPLOAD_DIR, 'exports'),
  ];

  dirs.forEach((dir) => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`📁 Created storage directory: ${dir}`);
    }
  });
};

const getUploadPath = (type = 'general') => {
  return path.join(UPLOAD_DIR, type);
};

module.exports = { initStorage, getUploadPath, UPLOAD_DIR };
