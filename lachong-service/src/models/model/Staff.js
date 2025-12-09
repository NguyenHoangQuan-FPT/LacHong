const mongoose = require('mongoose');

const staffSchema = new mongoose.Schema({
    fullName: { type: String, required: true },
    phone: { type: String, required: true, unique: true },
    address: { type: String },
    accountId: { type: mongoose.Schema.Types.ObjectId, ref: 'Account' },
    storeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Store' },
    status: { type: Boolean, default: true }
}, {
    timestamps: true
});

const Staff = mongoose.model('Staff', staffSchema);

module.exports = Staff;