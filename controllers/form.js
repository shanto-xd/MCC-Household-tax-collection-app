const Survey = require('../models/survey');
const User = require('../models/user');
const Order = require('../models/order');
const invoice = require('../util/pdfGenerator');

const sharp = require('sharp');
const shortUniqueId = require('short-unique-id');
const fs = require('fs');
const uniqueRandom = require('unique-random');
// const PDFKit = require('pdfkit');
// const PDF = require('pdfmake');
// const font = require('pdfmake/build/vfs_fonts');
// const path = require('path');

const uid = new shortUniqueId();

exports.getLandingPage = (req, res, next) => {
    res.render('landing');
}

exports.getDashboard = (req, res, next) => {
    const userRole = req.query.role;

    if (userRole == "ফিল্ড অফিসার") {
        return res.render('field-officer/index', { userRole: userRole });
    } else if (userRole == "প্রডাকশন অফিসার") {
        return res.render('production-officer/index', { userRole: userRole });
    } else if (userRole == "ইন্সপেকশন অফিসার") {
        return res.render('inspection-officer/index', { userRole: userRole });
    } else if (userRole == "এডমিন") {
        return res.render('admin/index', { userRole: userRole });
    } else {
        return res.redirect('back');
    }

}

exports.getForm = (req, res, next) => {
    res.render('form/survey-form');
}

exports.postForm = async (req, res, next) => {
    // saves all data to db then
    const survey = await new Survey({
        ownerName: req.body.ownerName,
        ownersFH: req.body.ownersFH,
        areaName: req.body.areaName,
        ward: req.body.ward,
        age: req.body.age,
        occupation: req.body.occupation,
        road: req.body.road,
        holding: req.body.holding,
        block: req.body.block,
        thana: req.body.thana,
        freedomFighter: req.body.freedomFighter,
        mobile: req.body.mobile,
        holdingType: req.body.holdingType,
        holdingName: req.body.holdingName,
        holdingStructure: req.body.holdingStructure,
        length: req.body.length,
        wide: req.body.wide,
        volume: req.body.volume,
        ownership: req.body.ownership,
        rent: req.body.rent,
        maleMember: req.body.maleMember,
        femaleMember: req.body.femaleMember,
        yearlyIncome: req.body.yearlyIncome,
        waterSource: req.body.waterSource,
        sanitationStatus: req.body.sanitationStatus,
        gasConnection: req.body.gasConnection,
    });

    try {
        const result = await survey.save();
        // console.log(result);
        res.redirect('/upload-image?sid=' + result._id);
    } catch (err) {
        console.log(err);
    }
}

exports.getUploadImage = async (req, res, next) => {
    try {
        const survey = await Survey.findById(req.query.sid);
        // console.log(survey);
        res.render('form/upload-image', {
            id: survey._id,
            holdingStructure: survey.holdingStructure,
            ownership: survey.ownership,
            volume: survey.volume,
        });
    } catch (err) {
        console.log(err);
        res.redirect('/form');
    }
}

exports.postUploadImage = async (req, res, next) => {
    // saves image and calculate tax then
    let time = new Date();
    let filename = 'images/' + uid.randomUUID(13) + req.file.originalname;
    const random = uniqueRandom(1, 1000000);
    let assessment_id = random();
    console.log(assessment_id);

    try {
        const resizedImage = await sharp(req.file.path).rotate().resize(800, 800).toFile(filename);
        await fs.unlink(req.file.path, err => {
            if (err) console.log(err);
        })

        const survey = await Survey.findById(req.query.sid);

        survey.assessment_id = assessment_id;
        survey.imageUrl = filename;
        survey.monthlyRentPerSF = req.body.monthlyRentPerSF;
        survey.yearlyTax = req.body.yearlyTax;
        survey.yearlyEvalution = req.body.yearlyEvalution;

        await survey.save();
        // console.log(survey.assessment_id);

        res.redirect('/confirm-order?sid=' + survey._id);
    } catch (err) {
        console.log(err);
    }
}

exports.getConfirmOrder = async (req, res, next) => {
    try {
        const survey = await Survey.findById(req.query.sid);
        res.render('form/confirm-order', { assessment_id: survey.assessment_id, id: survey._id });
    } catch (err) {
        console.log(err);
    }
}

exports.postConfirmOrder = async (req, res, next) => {
    try {
        const order = await new Order();
        order.survey = req.query.sid;
        await order.populate('survey').execPopulate();
        order.paid = 'Paid';
        order.plateSize = req.body.plateSize;
        order.orderStatus = 'প্রক্রিয়াধীন';
        await order.save();

        //create invoice
        const billNo = uid.randomUUID(6);
        await invoice.createInvoice(order, billNo, res);
    } catch (err) {
        console.log(err);
    }
}

exports.getOrderPlate = (req, res, next) => {
    res.render('field-officer/holding-plate', { userRole: req.query.role });
}

exports.postOrderPlate = async (req, res, next) => {
    try {
        const survey = await Survey.findOne({ assessment_id: req.body.assessment_id })
        res.redirect('/confirm-order?sid=' + survey._id);
    } catch (err) {
        console.log(err);
    }
}

exports.getDailyReport = (req, res, next) => {
    res.render('field-officer/daily-report', { userRole: req.query.role });
}

exports.postSearchInfo = async (req, res, next) => {
    const filter = req.body.filter;
    const keys = req.body.keys.split(',')
    let obj = {}

    if (typeof filter !== 'string') {
        for (let i = 0; i < filter.length; i++) {
            obj[filter[i]] = keys[i];
        }
    } else {
        obj[filter] = keys[0]
    }

    const survey = await Survey.find(obj)
    // console.log(survey);
    res.render('form/show-info', { surveyInfo: survey, userRole: req.query.role });
} 