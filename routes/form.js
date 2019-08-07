const express = require('express');
const router = express.Router();
const formController = require('../controllers/form');


router.get('/', formController.getLandingPage);

module.exports = router;