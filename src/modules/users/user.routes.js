const express = require('express');
const router = express.Router();
const { protect } = require('../auth/auth.middleware');
const { getProfile, updateProfile, updateAvatar, changePassword, deleteAccount } = require('./user.controller');
const { uploadAvatar } = require('../../shared/middlewares/upload');

router.use(protect);

router.get('/profile', getProfile);
router.patch('/profile', updateProfile);
router.patch('/avatar', uploadAvatar, updateAvatar);
router.patch('/password', changePassword);
router.delete('/account', deleteAccount);

module.exports = router;
