const mongoose = require('mongoose');
const Schema = mongoose.Schema;
// Workaround bug. An empty String causes validation error when the field is required
mongoose.Schema.Types.String.checkRequired(v => v != null);

const invoiceSchema = new Schema({
    _id: {
        type: String,
    },
    invoiceId: {
        type: Number,
        required: true,
        unique: true,
        min: 1
    },
    series: {
        type: String,
        required: true
    },
    number: {
        type: Number,
        required: true,
        min: 1
    },
    date: {
        type: String,
        required: true
    },
    customerId: {
        type: String
    },
    paymentMethod: {
        type: String
    }
}, {
    timestamps: true,
    _id: false //  _id not automatically created
});
invoiceSchema.index({ series: 1, number: 1 }, { unique: true })
module.exports = mongoose.model('Invoice', invoiceSchema);