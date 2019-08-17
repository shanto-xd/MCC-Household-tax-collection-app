const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const surveySchema = new Schema({
    ownerName: {
        type: String,
        required: true,
    },
    ownersFH: {
        type: String,
        required: true,
    },
    areaName: {
        type: String,
        required: true,
    },
    ward: {
        type: Number,
        required: true,
    },
    age: String,
    occupation: {
        type: String,
        required: true,
    },
    road: {
        type: String,
        required: true,
    },
    holding: {
        type: String,
        required: true,
    },
    block: {
        type: String,
        required: true,
    },
    thana: {
        type: String,
        required: true,
    },
    freedomFighter: {
        type: String,
        required: true,
    },
    mobile: {
        type: String,
        required: true,
    },
    holdingType: {
        type: String,
        required: true,
    },
    holdingName: {
        type: String,
        required: true,
    },
    holdingStructure: {
        type: String,
        required: true,
    },
    length: Number,
    wide: Number,
    volume: {
        type: Number,
        required: true,
    },
    ownership: {
        type: String,
        required: true,
    },
    rent: {
        type: Number,
        default: 0,
    },
    maleMember: {
        type: Number,
        default: 0,
        required: true,
    },
    femaleMember: {
        type: Number,
        default: 0,
        required: true,
    },
    yearlyIncome: {
        type: Number,
        default: 0,
        required: true,
    },
    waterSource: {
        type: String,
        required: true,
    },
    sanitationStatus: {
        type: String,
        required: true,
    },
    gasConnection: {
        type: String,
        required: true,
    },
    imageUrl: {
        type: String,
        // required: true,
        default: '',
    },
    assessment_id: {
        type: String,
        // required: true,
        default: '',
    },
    monthlyRentPerSF: {
        type: Number,
        // required: true,
        default: 0,
    },
    yearlyEvalution: {
        type: String,
        // required: true,
        default: '',
    },
    yearlyTax: {
        type: Number,
        // required: true,
        default: 0,
    },
    conductedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        // required: true,
    }
}, { timestamps: true });

module.exports = mongoose.model('Survey', surveySchema);