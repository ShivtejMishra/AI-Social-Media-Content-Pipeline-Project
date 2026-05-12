const express = require('express');
const router = express.Router();
const workspaceController = require('./workspace.controller');
const { protect } = require('../auth/auth.middleware');
const { uploadLogo } = require('../../shared/middlewares/upload');

router.use(protect);

router.post('/', workspaceController.createWorkspace);
router.get('/', workspaceController.getWorkspaces);
router.get('/:id', workspaceController.getWorkspaceById);
router.patch('/:id', workspaceController.updateWorkspace);
router.delete('/:id', workspaceController.deleteWorkspace);
router.patch('/:id/logo', uploadLogo, workspaceController.uploadLogo);

module.exports = router;
