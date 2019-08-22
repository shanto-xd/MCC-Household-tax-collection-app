const express = require('express')
const router = express.Router()
const formController = require('../controllers/form')

router.get('/', formController.getLandingPage)

router.get('/dashboard', formController.getDashboard)

router.get('/form', formController.getForm)

router.post('/form', formController.postForm)

router.get('/upload-image', formController.getUploadImage)

router.post('/upload-image', formController.postUploadImage);

router.get('/confirm-order', formController.getConfirmOrder);

router.post('/confirm-order', formController.postConfirmOrder);

router.get('/order-plate', formController.getOrderPlate);

router.post('/order-plate', formController.postOrderPlate);

router.get('/fo/daily-report', formController.getDailyReport);

router.post('/search-info', formController.postSearchInfo);

router.get('/orders', formController.getOrders);


module.exports = router
