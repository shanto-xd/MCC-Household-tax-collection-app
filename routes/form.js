const express = require('express')
const router = express.Router()
const formController = require('../controllers/form')
const auth = require('../middleware')

router.get('/', formController.getLandingPage)

router.get('/dashboard', auth.isAuthenticated, formController.getDashboard)

router.get('/form', formController.getForm)

router.post('/form', formController.postForm)

router.get('/upload-image', formController.getUploadImage)

router.post('/upload-image', formController.postUploadImage);

router.get('/confirm-order', formController.getConfirmOrder);

router.post('/confirm-order', formController.postConfirmOrder);

router.get('/order-plate', formController.getOrderPlate);

router.post('/order-plate', formController.postOrderPlate);

router.get('/fo/daily-report', formController.getDailyReport);

router.post('/fo/daily-report', formController.postDailyReport)

router.get('/orders', formController.getOrders);

router.post('/orders', formController.postOrders);

router.get('/show-info/:sid', formController.getShowInfo);

router.post('/orders/plate-delivery/:sid', formController.postPlateDelivery)

router.get('/survey-info', formController.getSurveyInfo)

router.post('/survey-info', formController.postSurveyInfo)

router.get('/survey-info/update/:sid', formController.getUpdateSurveyInfo)

router.post('/survey-info/update/:sid', formController.postUpdateSurveyInfo)

router.get('/survey-info/date', formController.getSurveyInfoByDate)

router.post('/survey-info/date', formController.postSurveyInfoByDate)

router.get('/officers-panel', auth.isAdmin, formController.getOfficersPanel)

router.post('/officers-panel', auth.isAdmin, formController.postOfficersPanel)

router.get('/officers/:user_id', auth.isAdmin, formController.getOfficers)

router.post('/survey-info/download', auth.isAdmin, formController.postDownloadSurveyInfo)

router.get('/reports', formController.getReports)

// router.get('/reports/details/:uid', formController.getReportsDetail)

router.get('/survey-info/delete/:sid', formController.getDeleteSurvey)

router.get('/po/daily-orders', formController.getDailyOrders)

router.post('/po/daily-orders', formController.postDailyOrders)

router.get('/download/invoice/:sid', formController.getDownloadInvoice)

module.exports = router
