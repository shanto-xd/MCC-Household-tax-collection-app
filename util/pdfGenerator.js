const PDFKit = require('pdfkit');
const fs = require('fs');
const path = require('path')


exports.createInvoice = async (order, billNo, res) => {

    try {
        const pdf = new PDFKit({ margin: 50 });
        const invoiceName = order.survey.holdingName + billNo + '.pdf';
        const invoicePath = path.join('data', 'invoices', invoiceName);

        res.set('Content-Type', 'application/pdf');
        res.set('Content-Disposition', 'inline; filename="' + invoiceName + '"', 'utf-8');

        pdf.registerFont('SolaimanLipi', 'public\\fonts\\SolaimanLipi.ttf');

        await pdf.pipe(fs.createWriteStream(invoicePath));
        await pdf.pipe(res);

        var dt = new Date();
        var mm = dt.getMonth() + 1;
        var dd = dt.getDate();
        var yyyy = dt.getFullYear();
        var format = dd + '/' + mm + '/' + yyyy


        await pdf
            .image('public\\images\\logo.png', 145, 42, { width: 50, align: 'center' })
            .fillColor('#444444')
            .font('SolaimanLipi')
            .fontSize(25)
            .text('ময়মনসিংহ সিটি কর্পোরেশন', { align: 'center' })
            .fontSize(18)
            .text('নগর ভবন, ময়মনসিংহ', { align: 'center' })

        await pdf
            .fontSize(15)
            .font('SolaimanLipi')
            .text('বিল নং -', 50, 150, { align: 'left' })
            .font('Helvetica')
            .text(order.bill, 100, 150);

        await pdf
            .font('SolaimanLipi')
            .text('তারিখ - ', 400, 150)
            .font('Helvetica')
            .text(format, 450, 150);

        await pdf
            .text('---------------------------------------------------------------------------------------------', 50, 170);

        await pdf
            .font('SolaimanLipi')
            .fontSize(18)
            .text('এসেসমেন্ট আইডি -     ', 50, 220)
            .font('Helvetica')
            .text(order.survey.assessment_id, 180, 220)


        await pdf
            .font('SolaimanLipi')
            .text(`বাড়ির নাম -     ${order.survey.holdingName}`, 50, 240)
            .text(`মালিকের নাম -     ${order.survey.ownerName}`)
            .text(`রাস্তা/মহল্লার নাম -     ${order.survey.road}`)
            .text(`অঞ্চল -     ${order.survey.areaName}`)
            .text(`মোবাইল নং -     ${order.survey.mobile}`)
            .text(`প্লেট সাইজ -     ${order.plateSize}`)

        await pdf
            .text('ব্লক -     ')
            .font('Helvetica')
            .fontSize(15)
            .text(order.survey.block, 100, 370)

        await pdf
            .font('SolaimanLipi')
            .fontSize(18)
            .text('হোল্ডিং নং -     ', 50, 390)
            .font('Helvetica')
            .fontSize(15)
            .text(order.survey.holding, 120, 395)

        await pdf
            .font('SolaimanLipi', 18)
            .text('ওয়ার্ড নং -     ', 50, 415)
            .font('Helvetica', 15)
            .text(order.survey.ward, 120, 420);


        await pdf
            .text('---------------------------------------------------------------------------------------------', 50, 430);


        await pdf
            .font('SolaimanLipi', 22)
            .moveDown()
            .text('হোল্ডিং গণনা এবং হোল্ডিং নাম্বার প্লেট স্থাপন প্রকল্প বাস্তবায়নে ময়মনসিংহ সিটি কর্পোরেশন কর্তৃক ধার্যকৃত ৪০০ টাকা (চারশত) গ্রহন করা হল')
            .moveDown(5)
            .fontSize(10)
            .text('**এই স্লিপটি সংরক্ষণ করুন, যোগাযোগ - ০১৮১৮৭৫৫৪০০, ০১৬২৩৯৯৫১৪৫**', { align: 'center' })

        pdf.end()
    } catch (err) {
        console.log(err);
    }

}
