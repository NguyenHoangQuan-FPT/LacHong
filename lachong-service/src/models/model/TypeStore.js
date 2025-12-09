const mongoose = require('mongoose');

const typeStoreSchema = new mongoose.Schema({
    typeName: { type: String, required: true, unique: true },
    description: { type: String }
}, {
    timestamps: true
});

const TypeStore = mongoose.model('TypeStore', typeStoreSchema);

module.exports = TypeStore;