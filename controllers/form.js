const Survey = require('../models/survey');
const User = require('../models/user');
const invoice = require('../util/pdfGenerator');
const dateFormatter = require('../util/date-formatter');

const sharp = require('sharp');
const shortUniqueId = require('short-unique-id');
const fs = require('fs');
const uniqueRandom = require('unique-random');

const uid = new shortUniqueId();
const PER_PAGE = 5

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
	res.render('form/survey-form');
}

exports.postForm = async (req, res, next) => {
	// saves all data to db then
	try {
		const survey = await new Survey({
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
			created: new Date().toDateString(),
		});
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
		});
	} catch (err) {
		const error = new Error(err);
		error.httpStatusCode = 500;
		return next(error);
	}
}

exports.postUploadImage = async (req, res, next) => {
	// saves image and calculate tax then
	// let time = new Date();

	try {
		let imageUrl = uid.randomUUID(13) + req.file.originalname
		let filename = 'images/' + imageUrl;
		const random = uniqueRandom(1, 1000000);
		let assessment_id = random();
		// console.log(assessment_id);
		const resizedImage = await sharp(req.file.path).rotate().resize(800, 800).toFile(filename);
		await fs.unlink(req.file.path, err => {
			if (err) next;
		})

		const survey = await Survey.findById(req.query.sid);

		survey.assessment_id = assessment_id;
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
		res.render('form/confirm-order', { assessment_id: survey.assessment_id, id: survey._id });
	} catch (err) {
		const error = new Error(err);
		error.httpStatusCode = 500;
		return next(error);
	}
}

exports.postConfirmOrder = async (req, res, next) => {
	try {
		const survey = await Survey.findById(req.query.sid);
		survey.orderPaid = 'Paid';
		survey.plateSize = req.body.plateSize;
		survey.orderStatus = 'In progress...';
		await survey.save()

		//create invoice
		const billNo = uid.randomUUID(6);
		await invoice.createInvoice(survey, billNo, res);
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
		const survey = await Survey.findOne({ assessment_id: req.body.assessment_id })
		res.redirect('/confirm-order?sid=' + survey._id);
	} catch (err) {
		const error = new Error(err);
		error.httpStatusCode = 500;
		return next(error);
	}
}

exports.getDailyReport = (req, res, next) => {
	res.render('field-officer/daily-report', { userRole: req.query.role });
}

exports.getOrders = async (req, res, next) => {
	const page = +req.query.page || 1;
	const filter = req.query.filter || '';
	let keys = req.query.keys || '';

	let obj = { orderStatus: 'In progress...' }

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
		const surveys = await Survey.find(obj).skip((page - 1) * PER_PAGE).limit(PER_PAGE).sort('holding').exec()

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

	let obj = { orderStatus: 'In progress...' }

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
		const surveys = await Survey.find(obj).sort('holding')
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
			userRole: 'প্রডাকশন অফিসার',
			created: dateFormatter.dateFormatter(survey.createdAt),
			updated: dateFormatter.dateFormatter(survey.updatedAt),
		})
	} catch (err) {
		const error = new Error(err);
		error.httpStatusCode = 500;
		return next(error);
	}
}

exports.postPlateDelivery = async (req, res, next) => {
	const delivery = req.query.delivery
	const sid = req.params.sid
	const page = req.query.page

	try {
		const survey = await Survey.findById(sid)
		if (delivery == 'true') {
			survey.orderStatus = 'Delivered'
		} else if (delivery == 'false') {
			survey.orderStatus = 'Canceled'
			survey.orderPaid = ''
			survey.plateSize = ''
		}
		await survey.save()
		res.redirect('/orders?page=' + page + '&role=প্রডাকশন অফিসার')
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
		const surveys = await Survey.find(obj).skip((page - 1) * PER_PAGE).limit(PER_PAGE).sort('holding').exec()
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
		const surveys = await Survey.find(obj).sort('holding')
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
		var keys = req.query.keys || ''
		var page = req.query.page || 1
		let obj = {}

		if (filter != '' && keys != '') {
			obj[filter] = keys
		}
		const count = await Survey.find(obj).countDocuments()
		const surveys = await Survey.find(obj).skip((page - 1) * PER_PAGE).limit(PER_PAGE).sort('holding').exec()

		res.render('inspection-officer/survey-info', {
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

exports.postSurveyInfoByDate = async (req, res, next) => {
	try {
		var date = new Date(req.body.date).toDateString()
		const page = 1

		const surveys = await Survey.find({ created: date }).skip((page - 1) * PER_PAGE).limit(PER_PAGE).sort('holding').exec()
		const count = await Survey.find({ created: date }).countDocuments()

		res.render('inspection-officer/survey-info', {
			surveys: surveys,
			userRole: req.query.role,
			currentPage: 1,
			lastPage: Math.ceil(count / PER_PAGE),
			filter: 'created',
			keys: date,
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