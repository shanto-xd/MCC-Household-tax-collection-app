

exports.getLogin = (req, res, next) => {
    const userRole = req.query.role;
    res.render('auth/login', { userRole: userRole });
}

exports.postLogin = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    // check for authentication then
    res.redirect('/dashboard' + '?role=' + req.query.role);
}

exports.getResetPassword = (req, res, next) => {
    res.render('auth/forgot-password');
}