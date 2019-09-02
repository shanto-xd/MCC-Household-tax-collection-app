const uniqueRandom = require('unique-random')
const bcrypt = require('bcryptjs')
const shortUniqueId = require('short-unique-id')
const fs = require('fs')
const sharp = require('sharp')

const uid = new shortUniqueId()

const User = require('../models/user')

exports.getLogin = (req, res, next) => {
    const userRole = req.query.role;
    res.render('auth/login', { userRole: userRole });
}

exports.postLogin = (req, res, next) => {
    const username = req.body.username;
    const password = req.body.password;

    User.findOne({ username: username })
        .then(user => {
            if (!user) {
                req.flash('error', 'Wrong username/password. Please try again...')
                return res.status(422).render('auth/login', { userRole: req.query.role });
            }
            if (req.body.remember) {
                req.session.cookie.originalMaxAge = 24 * 60 * 60 * 1000 // Expires in 1 day
            } else {
                req.session.cookie.expires = false
            }
            bcrypt
                .compare(password, user.password)
                .then(doMatch => {
                    if (doMatch) {
                        req.session.isLoggedIn = true;
                        req.session.user = user;
                        return req.session.save(err => {
                            // console.log(err);
                            req.flash('success', req.query.role + ' ড্যাশবোর্ডে স্বাগতম!')
                            res.redirect('/dashboard?role=' + req.query.role);
                        });
                    }
                    req.flash('error', 'Wrong username/password. Please try again...')
                    return res.status(422).render('auth/login', { userRole: req.query.role });
                })
                .catch(err => {
                    // console.log(err);
                    req.flash('error', 'Wrong username/password. Please try again...')
                    res.redirect('/auth/login?role=' + req.query.role);
                });
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
};

exports.postLogout = (req, res, next) => {
    req.session.destroy(err => {
        // console.log(err);
        res.redirect('/');
    });
};

exports.getResetPassword = (req, res, next) => {
    res.render('auth/forgot-password');
}

exports.getSignup = async (req, res, next) => {
    const uid = uniqueRandom(1111111, 9999999)
    res.render('auth/signup', { office_id: uid(), userRole: req.query.role })
}

exports.postSignup = async (req, res, next) => {
    try {
        const password = req.body.password
        const hashedPassword = await bcrypt.hash(password, 12)
        let imageUrl = uid.randomUUID(13) + req.file.originalname
        let filename = 'images/' + imageUrl
        await sharp(req.file.path).rotate().resize(800, 800).toFile(filename)
        await fs.unlink(req.file.path, err => {
            if (err) next(err);
        })

        // console.log(req.query.role)
        const user = await new User({
            name: req.body.name,
            username: req.body.username,
            password: hashedPassword,
            role: req.body.role,
            email: req.body.email,
            mobile: req.body.mobile,
            office_id: req.body.office_id,
            image: imageUrl
        })

        await user.save()
        res.redirect('/officers-panel?role=' + req.query.role);
    } catch (err) {
        const error = new Error(err)
        error.httpStatusCode = 500
        return next(error)
    }
}

exports.postUpdateProfile = async (req, res, next) => {
    try {
        const user_id = req.params.user_id
        const updateInfo = {
            name: req.body.name,
            username: req.body.username,
            email: req.body.email,
            mobile: req.body.mobile,
            role: req.body.role,
        }
        const user = await User.findByIdAndUpdate(user_id, updateInfo)
        res.redirect('/officers/' + user_id + '?role=' + req.query.role)
    } catch (err) {
        const error = new Error(err)
        error.httpStatusCode = 500
        return next(error)
    }
}

exports.postChangePassword = async (req, res, next) => {
    try {
        const user_id = req.params.user_id
        const password = req.body.password
        const hashedPassword = await bcrypt.hash(password, 12)
        const updateInfo = { password: hashedPassword }
        const user = await User.findByIdAndUpdate(user_id, updateInfo)
        res.redirect('/officers/' + user_id + '?role=' + req.query.role)
    } catch (err) {
        const error = new Error(err)
        error.httpStatusCode = 500
        return next(error)
    }
}

exports.postChangePhoto = async (req, res, next) => {
    try {
        const user_id = req.params.user_id
        const user = await User.findById(user_id)
        let filename = 'images/' + user.image

        if (fs.existsSync(filename)) {
            fs.unlink(filename, err => {
                if (err) return next(err)
            })
        }

        let imageUrl = uid.randomUUID(13) + req.file.originalname
        filename = 'images/' + imageUrl
        await sharp(req.file.path).rotate().resize(800, 800).toFile(filename)
        await fs.unlink(req.file.path, err => {
            if (err) next(err);
        })
        user.image = imageUrl
        await user.save()
        // console.log(isImageExist)
        res.redirect('/officers/' + user_id + '?role=' + req.query.role)
    } catch (err) {
        const error = new Error(err)
        error.httpStatusCode = 500
        return next(error)
    }
}

exports.postDeleteProfile = async (req, res, next) => {
    try {
        const user_id = req.params.user_id
        const user = await User.findById(user_id)
        let filename = 'images/' + user.image

        if (fs.existsSync(filename)) {
            fs.unlink(filename, err => {
                if (err) return next(err)
            })
        }
        await user.remove()
        res.redirect('/officers-panel?role=' + req.query.role);
    } catch (err) {
        const error = new Error(err)
        error.httpStatusCode = 500
        return next(error)
    }
}