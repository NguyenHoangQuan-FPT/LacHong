const mongoose = require('mongoose');

const storeSchema = new mongoose.Schema({
    storeName: { type: String, required: true, unique: true },
    phone: { type: String },
    address: { type: String },
    avatar: { type: String },
    emailStore: { type: String, required: true, unique: true },
    socialMedia: {
        facebook: { type: String },
        instagram: { type: String },
        twitter: { type: String }
    },
    policy: { type: String },
    typeStoreId: { type: mongoose.Schema.Types.ObjectId, ref: 'TypeStore' },
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Account' },
    status: { type: Boolean, default: true }
}, {
    timestamps: true
});

const Store = mongoose.model('Store', storeSchema);

module.exports = Store;