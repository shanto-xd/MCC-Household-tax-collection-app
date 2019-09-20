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
    if (req.session.isLoggedIn && (req.user.role == 'প্রডাকশন অফিসার')) {
        return next()
    } else {
        req.flash('error', 'Sorry, you are not allowed for the requested route...')
        return res.redirect('back')
    }
}

exports.surveyInfoPass = (req, res, next) => {
    if (req.session.isLoggedIn && (req.user.role == 'এডমিন' || req.user.role == 'ইন্সপেকশন অফিসার')) {
        return next()
    } else {
        req.flash('error', 'Sorry, you are not allowed for the requested route...')
        return res.redirect('back')
    }
}

exports.notFO = (req, res, next) => {
    if (req.session.isLoggedIn && (req.user.role !== 'ফিল্ড অফিসার')) {
        return next()
    } else {
        req.flash('error', 'Sorry, you are not allowed for the requested route...')
        return res.redirect('back')
    }
}

exports.dashboardPass = (req, res, next) => {
    if (req.session.isLoggedIn && (req.user.role == req.query.role)) {
        return next()
    } else {
        req.flash('error', 'Sorry, you are not allowed for the requested route...')
        return res.redirect('back')
    }
}