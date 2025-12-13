const mongoose = require('mongoose');

const likeSchema = new mongoose.Schema({
    post: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
    createdAt: { type: Date, default: Date.now }
});


module.exports = mongoose.model('Like', likeSchema);