const mongoose = require('mongoose');

const accountSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    roleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Role' },
    status: { type: Boolean, default: true },
    isActive: { type: Boolean, default: false },
    activationToken: { type: String },
    activationTokenExpires: { type: Date }
}, {
    timestamps: true
});

const Account = mongoose.model('Account', accountSchema);

module.exports = Account;