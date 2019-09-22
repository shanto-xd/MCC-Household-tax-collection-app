const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth');
const auth = require('../middleware')

router.get('/auth/login', authController.getLogin);

router.post('/auth/login', authController.postLogin);

router.post('/auth/logout', authController.postLogout)

router.get('/auth/reset-password', authController.getResetPassword);

router.get('/auth/signup', authController.getSignup)

router.post('/auth/signup', authController.postSignup)

router.post('/officers/update-profile/:user_id', auth.isAdmin, authController.postUpdateProfile)

router.post('/officers/change-password/:user_id', auth.isAdmin, authController.postChangePassword)

router.post('/officers/change-photo/:user_id', auth.isAdmin, authController.postChangePhoto)

router.post('/officers/delete-profile/:user_id', auth.isAdmin, authController.postDeleteProfile)

module.exports = router;