const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const path = require('path')
const mongoose = require('mongoose');
const multer = require('multer');
const shortUniqueId = require('short-unique-id');
const session = require('express-session')
const MongoDBStore = require('connect-mongodb-session')(session)
const flash = require('connect-flash')
const helmet = require('helmet')
const rateLimiter = require('express-rate-limit')

const seed = require('./seed');

const uid = new shortUniqueId();

//seed();


// import routes
const formRoutes = require('./routes/form')
const authRoutes = require('./routes/auth')

// import controllers
const errorController = require('./controllers/error')

// import db models
const User = require('./models/user')

// set headers to secure app
app.use(helmet())

// limit login attempt
// for reverse proxy -> heroku, digitalocean
app.set('trust proxy', 1)

const reqLimiter = rateLimiter({
	windowMs: 1 * 60 * 1000, // 1 minutes
	max: 100
})

// only apply to requests that begin with /api/
app.use("/auth/", reqLimiter);

// configure db conncetion
const MONGODB_URI = 'mongodb+srv://azad71:0076b@ecommerce-fgwuw.mongodb.net/mmc'

// configure session
const store = new MongoDBStore({
	uri: MONGODB_URI,
	collection: 'sessions'
});

// configure image file storages
const fileStorage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, 'images');
	},
	filename: (req, file, cb) => {
		cb(null, uid.randomUUID(13) + '-' + file.originalname);
	}
});

const fileFilter = (req, file, cb) => {
	if (
		file.mimetype === 'image/png' ||
		file.mimetype === 'image/jpg' ||
		file.mimetype === 'image/jpeg'
	) {
		cb(null, true);
	} else {
		cb(null, false);
	}
}

// configure csrf token

app.set('view engine', 'ejs')
app.set('views', 'views')
app.use(bodyParser.urlencoded({ extended: false }))
app.use(multer({ storage: fileStorage, fileFilter: fileFilter }).single('image'))
app.use(express.static(path.join(__dirname, 'public')))
app.use('/images', express.static(path.join(__dirname, 'images')))

// configure cookies and sessions
app.use(
	session({
		secret: 'my secret',
		resave: false,
		saveUninitialized: false,
		store: store
	})
);
app.use(flash());

app.use((req, res, next) => {
	// throw new Error('Sync Dummy');
	if (!req.session.user) {
		return next();
	}
	User.findById(req.session.user._id)
		.then(user => {
			if (!user) {
				return next();
			}
			req.user = user;
			res.locals.currentUser = user
			next();
		})
		.catch(err => {
			next(new Error(err));
		});
});

app.use((req, res, next) => {
	res.locals.isAuthenticated = req.session.isLoggedIn;
	res.locals.error = req.flash("error");
	res.locals.success = req.flash("success");
	res.locals.warning = req.flash("warning");
	// res.locals.csrfToken = req.csrfToken();
	next();
});

app.use(formRoutes)
app.use(authRoutes)

app.get('/500', errorController.get500);

app.use(errorController.get404);

app.use((error, req, res, next) => {
	// res.status(error.httpStatusCode).render(...);
	// res.redirect('/500');
	console.log(error);
	res.status(500).render('500', {
		pageTitle: 'Error!',
	});
});

mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useFindAndModify: false, useCreateIndex: true, })
	.then(() => {
		// console.log(result);
		console.log('Server is running at 3000');
		app.listen(3000);
	})
	.catch(err => {
		console.log(err);
	});

