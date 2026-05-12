const express = require('express');
const router = express.Router();
const analyticsController = require('./analytics.controller');
const { protect } = require('../auth/auth.middleware');

router.use(protect);

router.get('/overview', analyticsController.getOverview);
router.get('/workspace/:id', analyticsController.getWorkspaceAnalytics);
router.get('/usage', analyticsController.getUsage);

module.exports = router;
