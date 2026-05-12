const express = require('express');
const router = express.Router();
const exportController = require('./export.controller');
const { protect } = require('../auth/auth.middleware');

router.use(protect);

router.post('/pdf', exportController.exportPDF);
router.post('/markdown', exportController.exportMarkdown);
router.post('/json', exportController.exportJSON);
router.post('/zip', exportController.exportZip);
router.get('/:id/download', exportController.downloadExport);

module.exports = router;
