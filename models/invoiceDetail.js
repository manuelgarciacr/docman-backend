const mongoose = require('mongoose');
const Schema = mongoose.Schema;
// Workaround bug. An empty String causes validation error when the field is required
mongoose.Schema.Types.String.checkRequired(v => v != null);

const invoiceDetailSchema = new Schema({
    _id: {
        type: String
    },
    invoiceId: {
        type: Number,
        required: true,
        min: 1
    },
    line: {
        type: Number,
        required: true,
        min: 1
    },
    groupId: {
        type: String,
        required: true
    },
    subgroupId: {
        type: String,
        required: true
    },
    productId: {
        type: String,
        required: true
    },
    serviceId: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    quantity: {
        type: Number,
        require: true,
        min: 1
    },
    price: {
        type: Number,
        require: true,
        min: 1
    },
    tax: {
        type: Number,
        required: true,
        min: 0
    }
}, {
    timestamps: true,
    _id: false //  _id not automatically created
});
invoiceDetailSchema.index({ invoiceId: 1, line: 1}, { unique: true })
module.exports = mongoose.model('InvoiceDetail', invoiceDetailSchema);