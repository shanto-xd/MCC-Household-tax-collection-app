const express = require('express')
const router = express.Router()
const formController = require('../controllers/form')

router.get('/', formController.getLandingPage)

router.get('/dashboard', formController.getDashboard)

router.get('/form', formController.getForm)

router.post('/form', formController.postForm)

router.get('/upload-image', formController.getUploadImage)

router.post('/upload-image', formController.postUploadImage);

module.exports = router
