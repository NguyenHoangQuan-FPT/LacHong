const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
    address: { type: String, required: true },
    status: { type: Boolean, default: true },
    isDefault: { type: Boolean, default: false }
}, {
    timestamps: true
});

const Address = mongoose.model('Address', addressSchema);

module.exports = Address;