const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { getUploadPath } = require('../../config/storage');

const MAX_SIZE_MB = 5;

/**
 * Create multer storage for a given subfolder (e.g. 'avatars', 'logos')
 */
const createDiskStorage = (subFolder) => {
  return multer.diskStorage({
    destination: (req, file, cb) => {
      const dir = path.join(getUploadPath(''), subFolder);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      cb(null, dir);
    },
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase() || '.png';
      const name = `${subFolder}_${Date.now()}_${Math.random().toString(36).slice(2)}${ext}`;
      cb(null, name);
    },
  });
};

const imageFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed (JPEG, PNG, WEBP, GIF, SVG)'), false);
  }
};

/** Multer instance for avatar uploads */
const avatarUpload = multer({
  storage: createDiskStorage('avatars'),
  fileFilter: imageFilter,
  limits: { fileSize: MAX_SIZE_MB * 1024 * 1024 },
}).single('avatar');

/** Multer instance for workspace logo uploads */
const logoUpload = multer({
  storage: createDiskStorage('logos'),
  fileFilter: imageFilter,
  limits: { fileSize: MAX_SIZE_MB * 1024 * 1024 },
}).single('logo');

/**
 * Middleware wrapper that handles multer errors cleanly
 */
const handleUpload = (multerFn) => (req, res, next) => {
  multerFn(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ status: 'error', message: `File too large. Maximum size is ${MAX_SIZE_MB}MB.` });
      }
      return res.status(400).json({ status: 'error', message: err.message });
    }
    if (err) {
      return res.status(400).json({ status: 'error', message: err.message });
    }
    next();
  });
};

const uploadAvatar = handleUpload(avatarUpload);
const uploadLogo = handleUpload(logoUpload);

module.exports = { uploadAvatar, uploadLogo };
