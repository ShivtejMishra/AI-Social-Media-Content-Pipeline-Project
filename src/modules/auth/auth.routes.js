const express = require('express');
const router = express.Router();
const authController = require('./auth.controller');
const { protect } = require('./auth.middleware');
const validate = require('../../shared/middlewares/validate');
const { signupSchema, loginSchema, refreshTokenSchema } = require('./auth.validation');

router.post('/signup',            validate(signupSchema),       authController.signup);
router.post('/login',             validate(loginSchema),        authController.login);
router.post('/logout',            protect,                      authController.logout);
router.post('/refresh-token',                                   authController.refreshToken);
router.get('/me',                 protect,                      authController.getMe);

// OTP Email verification
router.post('/send-verification', protect,                      authController.sendVerification);
router.post('/verify-otp',        protect,                      authController.verifyOtp);

module.exports = router;
