const mongoose = require('mongoose');

const paymentMethod = new mongoose.Schema({
    name: { type: String, required: true },
}, {
    timestamps: true
});

const PaymentMethod = mongoose.model('PaymentMethod', paymentMethod);

module.exports = PaymentMethod; 