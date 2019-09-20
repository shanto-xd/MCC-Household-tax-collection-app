const Survey = require('../models/survey');
const User = require('../models/user');
const invoice = require('../util/pdfGenerator');
const dateFormatter = require('../util/date-formatter');

const sharp = require('sharp');
const shortUniqueId = require('short-unique-id');
const fs = require('fs');
const uniqueRandom = require('unique-random');
const csv = require('csv-express')
const path = require('path')

const uid = new shortUniqueId();
const PER_PAGE = 20

exports.getLandingPage = (req, res, next) => {
	res.render('landing');
}

exports.getDashboard = async (req, res, next) => {

	try {
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
	} catch (err) {
		const error = new Error(err);
		error.httpStatusCode = 404;
		return next(error);
	}
}

exports.getForm = (req, res, next) => {

	res.render('form/survey-form', { userRole: req.query.role });
}

exports.postForm = async (req, res, next) => {
	// saves all data to db then
	try {
		const random = uniqueRandom(10000, 10000000)
		let age
		if (req.body.age.length > 3) {
			age = String(new Date().getFullYear() - req.body.age)
		} else {
			age = req.body.age
		}

		const surveyInfo = {
			assessment_id: random(),
			ownerName: req.body.ownerName,
			fatherName: req.body.fatherName,
			motherName: req.body.motherName,
			postcode: req.body.postcode,
			ward: req.body.ward,
			age: age,
			occupation: req.body.occupation,
			road: req.body.road,
			holding: req.body.holding,
			thana: req.body.thana,
			freedomFighter: req.body.freedomFighter,
			mobile: req.body.mobile,
			id: req.body.id,
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
			totalMember: req.body.totalMember,
			yearlyIncome: req.body.yearlyIncome,
			waterSource: req.body.waterSource,
			sanitationStatus: req.body.sanitationStatus,
			gasConnection: req.body.gasConnection,
			roadExist: req.body.roadExist,
			roadType: req.body.roadType,
			streetlight: req.body.streetlight,
			created: new Date().toDateString(),
			updated: new Date().toDateString(),
			conductedBy: req.user._id,
		}
		const isDuplicate = await Survey.find(surveyInfo)
		console.log(isDuplicate)
		if (isDuplicate.length > 0) {
			req.flash('error', 'Duplicate entry. Please try again')
			return res.redirect('back')
		}
		const survey = new Survey(surveyInfo);
		const result = await survey.save();

		// console.log(result);
		res.redirect('/upload-image?sid=' + result._id);
	} catch (err) {
		const error = new Error(err);
		error.httpStatusCode = 500;
		return next(error);
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
			userRole: req.user.role,
		});
	} catch (err) {
		const error = new Error(err);
		error.httpStatusCode = 500;
		return next(error);
	}
}

exports.postUploadImage = async (req, res, next) => {
	try {
		let imageUrl
		if (req.file) {
			imageUrl = uid.randomUUID(13) + req.file.originalname
			let filename = 'images/' + imageUrl;
			await sharp(req.file.path).rotate().resize(800, 800).toFile(filename);
			fs.unlink(req.file.path, err => {
				if (err) next(err);
			})
		} else {
			imageUrl = 'profile.png'
		}

		const survey = await Survey.findById(req.query.sid);
		survey.imageUrl = imageUrl;
		survey.monthlyRentPerSF = req.body.monthlyRentPerSF;
		survey.yearlyTax = req.body.yearlyTax;
		survey.yearlyEvalution = req.body.yearlyEvalution;
		survey.updated = new Date().toDateString()

		await survey.save();
		// console.log(survey.assessment_id);

		res.redirect('/confirm-order?sid=' + survey._id);
	} catch (err) {
		const error = new Error(err);
		error.httpStatusCode = 500;
		return next(error);
	}
}

exports.getConfirmOrder = async (req, res, next) => {
	try {
		const survey = await Survey.findById(req.query.sid);
		res.render('form/confirm-order', {
			assessment_id: survey.assessment_id,
			id: survey._id,
			userRole: req.user.role,
		});
	} catch (err) {
		const error = new Error(err);
		error.httpStatusCode = 500;
		return next(error);
	}
}

exports.postConfirmOrder = async (req, res, next) => {
	try {
		const survey = await Survey.findById(req.query.sid)
		let invoicePath = ''
		if (survey.invoice !== undefined) {
			invoicePath = path.join('data', 'invoices', survey.invoice)
		}

		if (fs.existsSync(invoicePath)) {
			fs.unlink(invoicePath, err => {
				if (err) next(err)
			})
		}
		survey.orderPaid = 'Paid';
		survey.plateSize = req.body.plateSize;
		survey.orderStatus = 'In progress';
		survey.invoice = survey.holdingName + '-' + survey.orderBill + '.pdf';
		await survey.save()

		//create invoice
		await invoice.createInvoice(survey, res);
	} catch (err) {
		const error = new Error(err);
		error.httpStatusCode = 500;
		return next(error);
	}
}

exports.getOrderPlate = (req, res, next) => {
	res.render('field-officer/holding-plate', { userRole: req.query.role });
}

exports.postOrderPlate = async (req, res, next) => {
	try {
		let filter = req.body.filter
		const key = req.body.key
		const searchObj = {
			orderStatus: 'In progress',
			conductedBy: req.user._id,
		}
		searchObj[filter] = key

		const surveys = await Survey.find(searchObj)
		res.render('field-officer/show-orders', {
			userRole: req.user.role,
			surveys: surveys
		})
	} catch (err) {
		const error = new Error(err);
		error.httpStatusCode = 500;
		return next(error);
	}
}

exports.getDailyReport = async (req, res, next) => {
	try {
		const page = +req.query.page || 1
		var filter = req.query.filter || ''
		var keys = req.query.keys || ''
		const startDate = new Date()
		const day = 60 * 60 * 24 * 1000;
		const endDate = new Date(startDate.getTime() + day);
		let searchObj = {
			conductedBy: req.user._id,
			created: {
				$gte: startDate.toDateString(),
				$lt: endDate.toDateString()
			},
		}

		if (filter !== '' && keys !== '') {
			keys = keys.split(',')
			if (typeof filter !== 'string') {
				for (let i = 0; i < filter.length; i++) {
					searchObj[filter[i]] = keys[i];
				}
			} else {
				searchObj[filter] = keys[0]
			}
		}

		const count = await Survey.find(searchObj).countDocuments()
		const surveys = await Survey.find(searchObj).skip((page - 1) * PER_PAGE).limit(PER_PAGE).sort('holding')
		res.render('field-officer/daily-report', {
			surveys: surveys,
			userRole: req.query.role,
			currentPage: page,
			lastPage: Math.ceil(count / PER_PAGE),
			filter: filter,
			keys: keys,
		})
	} catch (err) {
		const error = new Error(err)
		error.httpStatusCode = 500
		return next(error)
	}
}

exports.postDailyReport = async (req, res, next) => {
	try {
		const filter = req.body.filter || '';
		let keys = req.body.keys || ''
		const page = +req.query.page || 1;
		const startDate = new Date()
		const day = 60 * 60 * 24 * 1000;
		const endDate = new Date(startDate.getTime() + day);

		let searchObj = {
			conductedBy: req.user._id,
			created: {
				$gte: startDate.toDateString(),
				$lt: endDate.toDateString()
			},
		}

		if (filter !== '' && keys !== '') {
			keys = keys.split(',')
			if (typeof filter !== 'string') {
				for (let i = 0; i < filter.length; i++) {
					searchObj[filter[i]] = keys[i];
				}
			} else {
				searchObj[filter] = keys[0]
			}
		}

		// console.log(searchObj)

		const count = await Survey.find(searchObj).countDocuments()
		const surveys = await Survey.find(searchObj).skip((page - 1) * PER_PAGE).limit(PER_PAGE).sort('holding')
		res.render('field-officer/daily-report', {
			surveys: surveys,
			userRole: req.user.role,
			currentPage: page,
			lastPage: Math.ceil(count / PER_PAGE),
			filter: filter,
			keys: keys,
		})
	} catch (err) {
		const error = new Error(err)
		error.httpStatusCode = 500
		return next(error)
	}
}

exports.getOrders = async (req, res, next) => {
	const page = +req.query.page || 1;
	const filter = req.query.filter || '';
	let keys = req.query.keys || '';

	let obj = { orderStatus: 'In progress' }

	try {
		if (filter !== '' && keys !== '') {
			keys = keys.split(',')
			if (typeof filter !== 'string') {
				for (let i = 0; i < filter.length; i++) {
					obj[filter[i]] = keys[i];
				}
			} else {
				obj[filter] = keys[0]
			}
		}

		const orderCount = await Survey.find(obj).countDocuments()
		const surveys = await Survey.find(obj).populate('conductedBy', 'name').skip((page - 1) * PER_PAGE).limit(PER_PAGE).sort('holding').exec()
		// console.log(surveys.conductedBy)
		res.render('form/show-orders', {
			surveys: surveys,
			userRole: req.query.role,
			currentPage: page,
			lastPage: Math.ceil(orderCount / PER_PAGE),
			filter: filter,
			keys: keys,
		});
	} catch (err) {
		const error = new Error(err);
		error.httpStatusCode = 500;
		return next(error);
	}
}

exports.postOrders = async (req, res, next) => {
	const filter = req.body.filter || '';
	let keys = req.body.keys || ''
	const page = +req.query.page || 1;

	let obj = { orderStatus: 'In progress' }

	try {
		if (filter !== '' && keys !== '') {
			keys = keys.split(',')
			if (typeof filter !== 'string') {
				for (let i = 0; i < filter.length; i++) {
					obj[filter[i]] = keys[i];
				}
			} else {
				obj[filter] = keys[0]
			}
		}

		const orderCount = await Survey.find(obj).countDocuments()
		const surveys = await Survey.find(obj).populate('conductedBy', 'name').skip((page - 1) * PER_PAGE).limit(PER_PAGE).sort('holding')
		res.render('form/show-orders', {
			surveys: surveys,
			userRole: req.query.role,
			currentPage: page,
			lastPage: Math.ceil(orderCount / PER_PAGE),
			filter: filter,
			keys: keys,
		});
	} catch (err) {
		const error = new Error(err);
		error.httpStatusCode = 500;
		return next(error);
	}
}

exports.getShowInfo = async (req, res, next) => {
	try {
		const survey = await Survey.findById(req.params.sid)

		res.render('form/show-info', {
			survey: survey,
			userRole: req.user.role,
		})
	} catch (err) {
		const error = new Error(err);
		error.httpStatusCode = 500;
		return next(error);
	}
}

exports.getOrderPlateNumber = (req, res, next) => {
	res.render('production-officer/plate-number', {
		userRole: req.user.role,
		sid: req.params.sid,
	})
}

exports.postPlateDelivery = async (req, res, next) => {
	const delivery = req.query.delivery
	const sid = req.params.sid

	try {
		const checkPlateNumber = await Survey.find({ plateNumber: req.body.plateNumber })
		if (checkPlateNumber.length > 0) {
			req.flash('error', 'Sorry, this plate number is already taken. Please try a new number')
			return res.redirect('back')
		}
		const survey = await Survey.findById(sid)
		if (delivery == 'true') {
			survey.orderStatus = 'Delivered'
			survey.plateNumber = req.body.plateNumber
		} else if (delivery == 'false') {
			survey.orderStatus = 'Canceled'
			survey.orderPaid = ''
			survey.plateSize = ''
		}

		await survey.save()
		res.redirect('/orders?role=' + req.user.role)
	} catch (err) {
		const error = new Error(err);
		error.httpStatusCode = 500;
		return next(error);
	}
}

exports.getSurveyInfo = async (req, res, next) => {
	const page = +req.query.page || 1;
	const filter = req.query.filter || '';
	let keys = req.query.keys || '';
	let obj = {}
	try {
		if (filter !== '' && keys !== '') {
			keys = keys.split(',')
			if (typeof filter !== 'string') {
				for (let i = 0; i < filter.length; i++) {
					obj[filter[i]] = keys[i];
				}
			} else {
				obj[filter] = keys[0]
			}
		}
		const count = await Survey.find(obj).countDocuments()
		const surveys = await Survey.find(obj).populate('conductedBy', 'name').skip((page - 1) * PER_PAGE).limit(PER_PAGE).sort('holding')
		res.render('inspection-officer/survey-info', {
			surveys: surveys,
			userRole: req.query.role,
			currentPage: page,
			lastPage: Math.ceil(count / PER_PAGE),
			filter: filter,
			keys: keys,
		})
	} catch (err) {
		const error = new Error(err);
		error.httpStatusCode = 500;
		return next(error);
	}
}

exports.postSurveyInfo = async (req, res, next) => {
	const filter = req.body.filter || '';
	let keys = req.body.keys || ''
	var page = +req.query.page || 1;
	let obj = {}

	try {
		if (filter !== '' && keys !== '') {
			keys = keys.split(',')
			if (typeof filter !== 'string') {
				for (let i = 0; i < filter.length; i++) {
					obj[filter[i]] = keys[i];
				}
			} else {
				obj[filter] = keys[0]
			}
		}
		const count = await Survey.find(obj).countDocuments()
		const surveys = await Survey.find(obj).populate('conductedBy', 'name').skip((page - 1) * PER_PAGE).limit(PER_PAGE).sort('holding')
		res.render('inspection-officer/survey-info', {
			surveys: surveys,
			userRole: req.query.role,
			currentPage: page,
			lastPage: Math.ceil(count / PER_PAGE),
			filter: filter,
			keys: keys,
		})
	} catch (err) {
		const error = new Error(err);
		error.httpStatusCode = 500;
		return next(error);
	}
}

exports.getUpdateSurveyInfo = async (req, res, next) => {
	try {
		const survey = await Survey.findById(req.params.sid);
		res.render('inspection-officer/update-info', { survey: survey, userRole: req.query.role, page: req.query.page })
	} catch (err) {
		const error = new Error(err);
		error.httpStatusCode = 500;
		return next(error);
	}
}

exports.postUpdateSurveyInfo = async (req, res, next) => {
	try {
		const survey = await {
			ownerName: req.body.ownerName,
			fatherName: req.body.fatherName,
			motherName: req.body.motherName,
			postcode: req.body.postcode,
			ward: req.body.ward,
			age: req.body.age,
			occupation: req.body.occupation,
			road: req.body.road,
			holding: req.body.holding,
			thana: req.body.thana,
			freedomFighter: req.body.freedomFighter,
			mobile: req.body.mobile,
			id: req.body.id,
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
			totalMember: req.body.totalMember,
			yearlyIncome: req.body.yearlyIncome,
			waterSource: req.body.waterSource,
			sanitationStatus: req.body.sanitationStatus,
			gasConnection: req.body.gasConnection,
			roadExist: req.body.roadExist,
			roadType: req.body.roadType,
			streetlight: req.body.streetlight,
			orderBill: req.body.orderBill,
			orderStatus: req.body.orderStatus,
			orderPaid: req.body.orderPaid,
			orderBill: req.body.orderBill,
			updated: new Date().toDateString(),
		}
		await Survey.findByIdAndUpdate(req.params.sid, survey)
		res.redirect('/survey-info?role=' + req.query.role + '&page=' + req.query.page)

	} catch (err) {
		const error = new Error(err)
		error.httpStatusCode = 500
		return next(error)
	}
}

exports.getSurveyInfoByDate = async (req, res, next) => {
	try {
		var filter = req.query.filter || ''
		var page = +req.query.page || 1
		var keys = req.query.keys || ''
		let time = keys.split(",")
		const date = {
			created: {
				$gte: time[0],
				$lte: time[1]
			}
		}
		const surveys = await Survey.find(date).populate('conductedBy', 'name').skip((page - 1) * PER_PAGE).limit(PER_PAGE).sort('holding').exec()
		const count = await Survey.find(date).countDocuments()
		// console.log(count)
		res.render('inspection-officer/survey-info', {
			surveys: surveys,
			userRole: req.user.role,
			currentPage: page,
			lastPage: Math.ceil(count / PER_PAGE),
			filter: filter,
			keys: keys,
		})
	} catch (err) {
		const error = new Error(err)
		error.httpStatusCode = 500
		return next(error)
	}
}

exports.postSurveyInfoByDate = async (req, res, next) => {
	try {
		var startDate = new Date(req.body.startDate)
		let endDate
		if (req.body.endDate) {
			endDate = new Date(req.body.endDate)
		} else {
			endDate = startDate
		}
		const date = {
			created: {
				$gte: startDate.toDateString(),
				$lte: endDate.toDateString(),
			},
		}
		var page = +req.query.page || 1;

		const surveys = await Survey.find(date).populate('conductedBy', 'name').skip((page - 1) * PER_PAGE).limit(PER_PAGE).sort('holding').exec()
		const count = await Survey.find(date).countDocuments()
		// console.log(count)
		res.render('inspection-officer/survey-info', {
			surveys: surveys,
			userRole: req.query.role,
			currentPage: page,
			lastPage: Math.ceil(count / PER_PAGE),
			filter: 'created',
			keys: [startDate.toDateString(), endDate.toDateString()],
		})
	} catch (err) {
		const error = new Error(err)
		error.httpStatusCode = 500
		return next(error)
	}
}

exports.getOfficersPanel = async (req, res, next) => {
	try {
		let admin = []
		let inspection_officer = []
		let field_officer = []
		let production_officer = []
		const users = await User.find()

		users.forEach(user => {
			if (user.role == 'এডমিন') {
				admin.push(user)
			} else if (user.role == 'ইন্সপেকশন অফিসার') {
				inspection_officer.push(user)
			} else if (user.role == 'ফিল্ড অফিসার') {
				field_officer.push(user)
			} else if (user.role == 'প্রডাকশন অফিসার') {
				production_officer.push(user)
			}
		})
		res.render('admin/officers-panel', {
			users: users,
			userRole: req.query.role,
			inspection_officer: inspection_officer,
			field_officer: field_officer,
			production_officer: production_officer,
			admin: admin
		})
	} catch (err) {
		const error = new Error(err)
		error.httpStatusCode = 500
		return next(error)
	}
}

exports.postOfficersPanel = async (req, res, next) => {
	try {
		const filter = req.body.filter
		const keys = req.body.keys

		let admin = []
		let inspection_officer = []
		let field_officer = []
		let production_officer = []
		let obj = {}
		obj[filter] = keys
		const users = await User.find(obj)

		users.forEach(user => {
			if (user.role == 'এডমিন') {
				admin.push(user)
			} else if (user.role == 'ইন্সপেকশন অফিসার') {
				inspection_officer.push(user)
			} else if (user.role == 'ফিল্ড অফিসার') {
				field_officer.push(user)
			} else if (user.role == 'প্রডাকশন অফিসার') {
				production_officer.push(user)
			}
		})
		res.render('admin/officers-panel', {
			users: users,
			userRole: req.query.role,
			inspection_officer: inspection_officer,
			field_officer: field_officer,
			production_officer: production_officer,
			admin: admin
		})
	} catch (err) {
		const error = new Error(err)
		error.httpStatusCode = 500
		return next(error)
	}
}

exports.getOfficers = async (req, res, next) => {
	try {
		const user_id = req.params.user_id
		const user = await User.findById(user_id)
		res.render('admin/officer-info', { user: user, userRole: req.query.role })
	} catch (err) {
		const error = new Error(err)
		error.httpStatusCode = 500
		return next(error)
	}
}

exports.postDownloadSurveyInfo = async (req, res, next) => {
	try {
		let filename = 'survey_info_ward_' + req.body.ward + '.csv'
		const surveys = await Survey.find({ ward: req.body.ward }).select('-_id -created -updated -__v').sort('holding').lean()
		res.statusCode = 200

		res.setHeader('Content-Type', 'text/csv');
		res.setHeader("Content-Disposition", 'attachment; filename=' + filename);
		res.csv(surveys, true);
	} catch (err) {
		const error = new Error(err)
		error.httpStatusCode = 500
		return next(error)
	}
}

exports.getReports = async (req, res, next) => {
	try {
		let start = new Date().toDateString()
		let orderCount = []
		let surveyCount = []
		const todaysEntry = await Survey.find({ created: start }).countDocuments()
		const todaysOrder = await Survey.find({ orderStatus: 'In progress', created: start }).countDocuments()
		const todaysDelivery = await Survey.find({ orderStatus: 'Delivered', updated: start }).countDocuments()
		const totalEntry = await Survey.find().countDocuments()
		const totalOrder = await Survey.find({ orderStatus: 'In progress' }).countDocuments()
		const totalDelivery = await Survey.find({ orderStatus: 'Delivered' }).countDocuments()
		const field_officers = await User.find({ role: 'ফিল্ড অফিসার' })

		for (let i = 0; i < field_officers.length; i++) {
			let orders = await Survey.find({
				conductedBy: field_officers[i]._id,
				created: start,
				$or: [
					{ orderStatus: 'In progress' },
					{ orderStatus: 'Delivered' }
				],
			})
			let entry = await Survey.find({ created: start, conductedBy: field_officers[i]._id })
			orderCount.push(orders)
			surveyCount.push(entry)
		}

		res.render('inspection-officer/report', {
			todaysEntry: todaysEntry,
			todaysOrder: todaysOrder,
			todaysDelivery: todaysDelivery,
			totalEntry: totalEntry,
			totalOrder: totalOrder,
			totalDelivery: totalDelivery,
			orderCount: orderCount,
			surveyCount: surveyCount,
			userRole: req.user.role,
			users: field_officers,
		})
	} catch (err) {
		const error = new Error(err)
		error.httpStatusCode = 500
		return next(error)
	}
}

// exports.getReportsDetail = async (req, res, next) => {
// 	try {
// 		var filter = req.query.filter || ''
// 		var keys = req.query.keys || ''
// 		var page = req.query.page || 1

// 		let obj = {
// 			conductedBy: req.params.uid,
// 			created: new Date().toDateString(),
// 		}
// 		if (filter !== '' && keys !== '') {
// 			keys = keys.split(',')
// 			if (typeof filter !== 'string') {
// 				for (let i = 0; i < filter.length; i++) {
// 					obj[filter[i]] = keys[i];
// 				}
// 			} else {
// 				obj[filter] = keys[0]
// 			}
// 		}

// 		const surveys = await Survey.find(obj).populate('conductedBy', 'name').skip((page - 1) * PER_PAGE).limit(PER_PAGE).sort('holding')
// 		const count = await Survey.find(obj).countDocuments()
// 		res.render('inspection-officer/survey-info', {
// 			surveys: surveys,
// 			userRole: req.user.role,
// 			currentPage: page,
// 			lastPage: Math.ceil(count / PER_PAGE),
// 			filter: filter,
// 			keys: keys,
// 		})
// 	} catch (err) {
// 		const error = new Error(err)
// 		error.httpStatusCode = 500
// 		return next(error)
// 	}
// }

exports.getDeleteSurvey = async (req, res, next) => {
	try {
		const survey = await Survey.findById(req.params.sid)
		let imagePath = '', invoicePath = ''
		if (survey.imageUrl !== undefined && survey.imageUrl !== 'profile.png') {
			imagePath = path.join('images', survey.imageUrl)
		}

		if (survey.invoice !== undefined) {
			invoicePath = path.join('data', 'invoices', survey.invoice)
		}

		if (fs.existsSync(imagePath)) {
			fs.unlink(imagePath, err => {
				if (err) next(err)
			})
		}

		if (fs.existsSync(invoicePath)) {
			fs.unlink(invoicePath, err => {
				if (err) next(err)
			})
		}
		await Survey.findByIdAndDelete(req.params.sid)
		res.redirect('/survey-info?role=' + req.user.role + '&page=' + req.query.page)
	} catch (err) {
		const error = new Error(err)
		error.httpStatusCode = 500
		return next(error)
	}
}

exports.getDailyOrders = async (req, res, next) => {
	try {
		const page = +req.query.page || 1;
		const filter = req.query.filter || '';
		let keys = req.query.keys || '';

		let searchObj = {
			orderStatus: 'In progress',
			created: new Date().toDateString(),
		}
		if (filter !== '' && keys !== '') {
			keys = keys.split(',')
			if (typeof filter !== 'string') {
				for (let i = 0; i < filter.length; i++) {
					searchObj[filter[i]] = keys[i];
				}
			} else {
				searchObj[filter] = keys[0]
			}
		}

		const orderCount = await Survey.find(searchObj).countDocuments()
		const surveys = await Survey.find(searchObj)
			.populate('conductedBy', 'name')
			.skip((page - 1) * PER_PAGE)
			.limit(PER_PAGE)
			.sort('holding')
		res.render('production-officer/daily-orders', {
			surveys: surveys,
			userRole: req.user.role,
			currentPage: page,
			lastPage: Math.ceil(orderCount / PER_PAGE),
			filter: filter,
			keys: keys,
		});
	} catch (err) {
		const error = new Error(err);
		error.httpStatusCode = 500;
		return next(error);
	}
}

exports.postDailyOrders = async (req, res, next) => {
	try {
		const filter = req.body.filter || '';
		let keys = req.body.keys || ''
		const page = +req.query.page || 1;

		let searchObj = {
			orderStatus: 'In progress',
			created: new Date().toDateString(),
		}

		if (filter !== '' && keys !== '') {
			keys = keys.split(',')
			if (typeof filter !== 'string') {
				for (let i = 0; i < filter.length; i++) {
					searchObj[filter[i]] = keys[i];
				}
			} else {
				searchObj[filter] = keys[0]
			}
		}

		const orderCount = await Survey.find(searchObj).countDocuments()
		const surveys = await Survey.find(searchObj)
			.populate('conductedBy', 'name')
			.skip((page - 1) * PER_PAGE)
			.limit(PER_PAGE)
			.sort('holding')
		res.render('production-officer/daily-orders', {
			surveys: surveys,
			userRole: req.user.role,
			currentPage: page,
			lastPage: Math.ceil(orderCount / PER_PAGE),
			filter: filter,
			keys: keys,
		});
	} catch (err) {
		const error = new Error(err);
		error.httpStatusCode = 500;
		return next(error);
	}
}

exports.getDownloadInvoice = async (req, res, next) => {
	try {
		const path = require('path')
		const survey = await Survey.findById(req.params.sid)
		const invoicePath = path.join('data', 'invoices', survey.invoice)
		if (fs.existsSync(invoicePath)) {
			res.download(invoicePath)
		} else {
			req.flash('error', 'Invoice not found!')
			return res.redirect('back')
		}
	} catch (err) {
		const error = new Error(err);
		error.httpStatusCode = 500;
		return next(error);
	}
}

exports.postUpdateImage = async (req, res, next) => {
	try {
		if (!req.file) {
			req.flash('error', 'No image selected. Please select an image')
			return res.redirect('back')
		}
		const survey = await Survey.findById(req.params.sid)
		let filename = 'images/' + survey.imageUrl

		if (fs.existsSync(filename)) {
			fs.unlink(filename, err => {
				if (err) return next(err)
			})
		}

		let imageUrl = uid.randomUUID(13) + req.file.originalname
		filename = 'images/' + imageUrl
		await sharp(req.file.path).rotate().resize(800, 800).toFile(filename)
		fs.unlink(req.file.path, err => {
			if (err)
				next(err);
		})
		survey.imageUrl = imageUrl
		survey.updated = new Date().toDateString()
		await survey.save()
		res.redirect('back')
	} catch (err) {
		const error = new Error(err)
		error.httpStatusCode = 500
		return next(error)
	}
}

exports.getDownloadImage = async (req, res, next) => {
	try {
		const survey = await Survey.findById(req.params.sid)
		let imagePath = ''
		if (survey.imageUrl !== undefined) {
			imagePath = path.join('images', survey.imageUrl)
		}

		if (fs.existsSync(imagePath)) {
			res.download(imagePath)
		} else {
			req.flash('error', 'Image not found!')
			return res.redirect('back')
		}

	} catch (err) {
		const error = new Error(err)
		error.httpStatusCode = 500
		return next(error)
	}
}