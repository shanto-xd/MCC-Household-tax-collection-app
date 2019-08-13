
exports.getLandingPage = (req, res, next) => {
    res.render('landing');
}

exports.getDashboard = (req, res, next) => {
    res.render('admin/index');
}

exports.getForm = (req, res, next) => {
    res.render('form/survey-form');
}

exports.postForm = (req, res, next) => {
    // saves all data to db then
    res.redirect('/upload-image');
}

exports.getUploadImage = (req, res, next) => {
    res.render('form/upload-image');
}

exports.postUploadImage = (req, res, next) => {
    // saves image and calculate tax then
    res.render('form/confirm-order');
}

exports.getOrder = (req, res, next) => {
    // generate pdf invoice 
}