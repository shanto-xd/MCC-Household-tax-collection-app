const Survey = require('../models/survey');
const User = require('../models/user');
const Order = require('../models/order');

const sharp = require('sharp');
const shortUniqueId = require('short-unique-id');
const fs = require('fs');
const PDFKit = require('pdfkit');
// const PDF = require('pdfmake');
// const font = require('pdfmake/build/vfs_fonts');
const path = require('path');

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
    let assessment_id = uid.randomUUID(6) + time.getTime().toString().substring(0, 5);

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
        const billNo = uid.randomUUID(6)
        const invoiceName = order.survey.holdingName + billNo + '.pdf';
        const invoicePath = path.join('data', 'invoices', invoiceName);
        const pdf = new PDFKit({ margin: 50 });

        console.log(invoicePath);

        res.set('Content-Type', 'application/pdf');
        res.set('Content-Disposition', 'inline; filename="' + invoiceName + '"', 'utf-8');

        pdf.registerFont('SolaimanLipi', 'public\\fonts\\SolaimanLipi.ttf');

        pdf.pipe(fs.createWriteStream(invoicePath));
        pdf.pipe(res);

        var dt = new Date();
        var mm = dt.getMonth() + 1;
        var dd = dt.getDate();
        var yyyy = dt.getFullYear();
        var format = dd + '/' + mm + '/' + yyyy


        pdf
            .image('public\\images\\logo.png', 145, 42, { width: 50, align: 'center' })
            .fillColor('#444444')
            .font('SolaimanLipi')
            .fontSize(25)
            .text('ময়মনসিংহ সিটি কর্পোরেশন', { align: 'center' })
            .fontSize(18)
            .text('নগর ভবন, ময়মনসিংহ', { align: 'center' })

        pdf
            .fontSize(15)
            .font('SolaimanLipi')
            .text('বিল নং -', 50, 150, { align: 'left' })
            .font('Helvetica')
            .text(order._id.toString().substring(18, 23), 100, 150);

        pdf
            .font('SolaimanLipi')
            .text('তারিখ - ', 400, 150)
            .font('Helvetica')
            .text(format, 450, 150);

        pdf
            .text('---------------------------------------------------------------------------------------------', 50, 170);

        pdf
            .font('SolaimanLipi')
            .fontSize(18)
            .text('এসেসমেন্ট আইডি -     ', 50, 220)
            .font('Helvetica')
            .text(order.survey.assessment_id, 180, 220)


        pdf
            .font('SolaimanLipi')
            .text(`বাড়ির নাম -     ${order.survey.holdingName}`, 50, 240)
            .text(`মালিকের নাম -     ${order.survey.ownerName}`)
            .text(`রাস্তা/মহল্লার নাম -     ${order.survey.road}`)
            .text(`অঞ্চল -     ${order.survey.areaName}`)
            .text(`মোবাইল নং -     ${order.survey.mobile}`)
            .text(`প্লেট সাইজ -     ${order.plateSize}`)

        pdf
            .text('ব্লক -     ')
            .font('Helvetica')
            .fontSize(15)
            .text(order.survey.block, 100, 370)

        pdf
            .font('SolaimanLipi')
            .fontSize(18)
            .text('হোল্ডিং নং -     ', 50, 390)
            .font('Helvetica')
            .fontSize(15)
            .text(order.survey.holding, 150, 395)

        pdf
            .text('---------------------------------------------------------------------------------------------', 50, 430);


        pdf
            .font('SolaimanLipi', 22)
            .moveDown()
            .text('হোল্ডিং গণনা এবং হোল্ডিং নাম্বার প্লেট স্থাপন প্রকল্প বাস্তবায়নে ময়মনসিংহ সিটি কর্পোরেশন কর্তৃক ধার্যকৃত ৪০০ টাকা (চারশত) গ্রহন করা হল')
            .moveDown(5)
            .fontSize(10)
            .text('**এই স্লিপটি সংরক্ষণ করুন, যোগাযোগ - ০১৮১৮৭৫৫৪০০, ০১৬২৩৯৯৫১৪৫**', { align: 'center' })

        pdf.end()


        // res.send('Working');
    } catch (err) {
        console.log(err);
    }
}

exports.getOrderPlate = (req, res, next) => {
    res.render('field-officer/holding-plate', { userRole: req.query.role });
}

exports.getDailyReport = (req, res, next) => {
    res.render('field-officer/daily-report', { userRole: req.query.role });
}