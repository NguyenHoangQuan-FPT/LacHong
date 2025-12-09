const mongoose = require('mongoose');

const voucherSchema = new mongoose.Schema({
    code: { type: String, required: true, unique: true },
    description: { type: String },
    discountPercentage: { type: Number, required: true },
    discountAmount: { type: Number, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    storeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Store', required: true },
    createBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Staff', required: true },
    status: { type: Boolean, default: true }
}, {
    timestamps: true
});

const Voucher = mongoose.model('Voucher', voucherSchema);

module.exports = Voucher;