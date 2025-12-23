const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
    fullName: { type: String },
    email: { type: String, required: true, unique: true },
    phone: { type: String },
    avatar: { type: String },
    dob: { type: Date },
    accountId: { type: mongoose.Schema.Types.ObjectId, ref: 'Account' },
    addresses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Address' }],
    createdAt: { type: Date, default: Date.now },
    status: { type: Boolean, default: true }
}, {
    timestamps: true
});

const Customer = mongoose.model('Customer', customerSchema);

module.exports = Customer;