

exports.getLogin = (req, res, next) => {
    const userRole = req.query.role;
    res.render('auth/login', { userRole: userRole });
}

exports.postLogin = (req, res, next) => {
    res.send('Working!');
}

exports.getResetPassword = (req, res, next) => {
    res.render('auth/forgot-password');
}