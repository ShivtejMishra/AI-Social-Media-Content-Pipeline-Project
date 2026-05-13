const multer = require('multer');

const MAX_SIZE_MB = 5;

const imageFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed (JPEG, PNG, WEBP, GIF, SVG)'), false);
  }
};

// Use memoryStorage — files stored in req.file.buffer, not disk
const memoryUpload = multer({
  storage: multer.memoryStorage(),
  fileFilter: imageFilter,
  limits: { fileSize: MAX_SIZE_MB * 1024 * 1024 },
});

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

const uploadAvatar = handleUpload(memoryUpload.single('avatar'));
const uploadLogo = handleUpload(memoryUpload.single('logo'));

module.exports = { uploadAvatar, uploadLogo };
