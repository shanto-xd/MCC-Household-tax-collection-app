exports.isAuthenticated = (req, res, next) => {
    if (req.session.isLoggedIn) {
        return next()
    } else {
        req.flash('warning', 'Please Login to continue...')
        return res.redirect('back')
    }

}

exports.isAdmin = (req, res, next) => {
    if (req.session.isLoggedIn && (req.user.role == 'এডমিন')) {
        return next()
    } else {
        req.flash('error', 'Sorry, you are not allowed for the requested route...')
        return res.redirect('back')
    }
}

exports.isFieldOfficer = (req, res, next) => {
    if (req.session.isLoggedIn && (req.user.role == 'ফিল্ড অফিসার')) {
        return next()
    } else {
        req.flash('error', 'Sorry, you are not allowed for the requested route...')
        return res.redirect('back')
    }
}

exports.isInspectionOfficer = (req, res, next) => {
    if (req.session.isLoggedIn && (req.user.role == 'ইন্সপেকশন অফিসার')) {
        return next()
    } else {
        req.flash('error', 'Sorry, you are not allowed for the requested route...')
        return res.redirect('back')
    }
}

exports.isProductionOfficer = (req, res, next) => {
    if (req.session.isLoggedIn && (req.user.role == 'প্রোডাকশন অফিসার')) {
        return next()
    } else {
        req.flash('error', 'Sorry, you are not allowed for the requested route...')
        return res.redirect('back')
    }
}