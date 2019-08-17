const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const orderSchema = new Schema({
    survey: {
        type: Schema.Types.ObjectId,
        ref: 'Survey',
        // required: true,
    },
    orderStatus: {
        type: String,
        // required: true,
    },
    plateSize: {
        type: String,
        // required: true,
    },
    paid: {
        type: String,
        // required: true,
    }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);