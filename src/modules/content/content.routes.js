const express = require('express');
const router = express.Router();
const contentController = require('./content.controller');
const { protect } = require('../auth/auth.middleware');

router.use(protect);

router.get('/', contentController.getContent);
router.get('/:id', contentController.getContentById);
router.patch('/:id', contentController.updateContent);
router.delete('/:id', contentController.deleteContent);
router.post('/:id/duplicate', contentController.duplicateContent);
router.post('/:id/approve', contentController.approveContent);

module.exports = router;
