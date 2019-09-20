const express = require('express')
const router = express.Router()
const formController = require('../controllers/form')
const auth = require('../middleware')

router.get('/', formController.getLandingPage)

router.get('/dashboard', auth.dashboardPass, formController.getDashboard)

router.get('/form', auth.isAuthenticated, formController.getForm)

router.post('/form', auth.isAuthenticated, formController.postForm)

router.get('/upload-image', auth.isAuthenticated, formController.getUploadImage)

router.post('/upload-image', auth.isAuthenticated, formController.postUploadImage);

router.get('/confirm-order', auth.isAuthenticated, formController.getConfirmOrder);

router.post('/confirm-order', auth.isAuthenticated, formController.postConfirmOrder);

router.get('/order-plate', auth.isFieldOfficer, formController.getOrderPlate);

router.post('/order-plate', auth.isFieldOfficer, formController.postOrderPlate);

router.get('/fo/daily-report', auth.isFieldOfficer, formController.getDailyReport);

router.post('/fo/daily-report', auth.isFieldOfficer, formController.postDailyReport)

router.get('/orders', auth.isProductionOfficer, formController.getOrders);

router.post('/orders', auth.isProductionOfficer, formController.postOrders);

router.get('/show-info/:sid', auth.isAuthenticated, formController.getShowInfo);

router.get('/order/plate-number/:sid', auth.isProductionOfficer, formController.getOrderPlateNumber)

router.post('/orders/plate-delivery/:sid', auth.isProductionOfficer, formController.postPlateDelivery)

router.get('/survey-info', auth.surveyInfoPass, formController.getSurveyInfo)

router.post('/survey-info', auth.surveyInfoPass, formController.postSurveyInfo)

router.get('/survey-info/update/:sid', auth.surveyInfoPass, formController.getUpdateSurveyInfo)

router.post('/survey-info/update/:sid', auth.surveyInfoPass, formController.postUpdateSurveyInfo)

router.get('/survey-info/date', auth.surveyInfoPass, formController.getSurveyInfoByDate)

router.post('/survey-info/date', auth.surveyInfoPass, formController.postSurveyInfoByDate)

router.get('/officers-panel', auth.isAdmin, formController.getOfficersPanel)

router.post('/officers-panel', auth.isAdmin, formController.postOfficersPanel)

router.get('/officers/:user_id', auth.isAuthenticated, formController.getOfficers)

router.post('/survey-info/download', auth.isAdmin, formController.postDownloadSurveyInfo)

router.get('/reports', auth.surveyInfoPass, formController.getReports)

// router.get('/reports/details/:uid', formController.getReportsDetail)

router.get('/survey-info/delete/:sid', auth.isAdmin, formController.getDeleteSurvey)

router.get('/po/daily-orders', auth.isProductionOfficer, formController.getDailyOrders)

router.post('/po/daily-orders', auth.isProductionOfficer, formController.postDailyOrders)

router.get('/download/invoice/:sid', auth.isAdmin, formController.getDownloadInvoice)

router.post('/update/image/:sid', auth.isAuthenticated, formController.postUpdateImage)

router.get('/download/image/:sid', auth.notFO, formController.getDownloadImage)

module.exports = router
