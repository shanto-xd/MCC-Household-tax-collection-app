const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const path = require('path')
const mongoose = require('mongoose');
const multer = require('multer');
const shortUniqueId = require('short-unique-id');


const uid = new shortUniqueId();


// const flash = require('connect-flash')

// import routes
const formRoutes = require('./routes/form')
const authRoutes = require('./routes/auth')
// import controllers
// import db models

// configure db conncetion
const MONGODB_URI = 'mongodb+srv://azad71:0076b@ecommerce-fgwuw.mongodb.net/mmc'

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

// configure cookies and sessions
// configure authentication
// configure csrf token

app.set('view engine', 'ejs')
app.set('views', 'views')
app.use(bodyParser.urlencoded({ extended: false }))
app.use(multer({ storage: fileStorage, fileFilter: fileFilter }).single('image'))
app.use(express.static(path.join(__dirname, 'public')))
app.use('/images', express.static(path.join(__dirname, 'images')))

app.use(formRoutes)
app.use(authRoutes)

mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useFindAndModify: false, useCreateIndex: true, })
	.then(() => {
		// console.log(result);
		console.log('Server is running at 3000');
		app.listen(3000);
	})
	.catch(err => {
		console.log(err);
	});

