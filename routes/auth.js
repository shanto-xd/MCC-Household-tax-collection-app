const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth');

router.get('/auth/login', authController.getLogin);

router.post('/auth/login', authController.postLogin);

router.get('/auth/reset-password', authController.getResetPassword);

module.exports = router;