const e = require('express');
const mongoose = require('mongoose');

const likeCommentSchema = new mongoose.Schema({
    comment: { type: mongoose.Schema.Types.ObjectId, ref: 'Comment', required: true },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
    createdAt: { type: Date, default: Date.now }
})

module.exports = mongoose.model('LikeComment', likeCommentSchema);