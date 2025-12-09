const mongoose = require('mongoose');

const materialSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    description: { type: String },
    status: { type: Boolean, default: true }
}, {
    timestamps: true
});

const Material = mongoose.model('Material', materialSchema);

module.exports = Material;