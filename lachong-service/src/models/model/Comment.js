const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    post: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
    parentComment: { type: mongoose.Schema.Types.ObjectId, ref: 'Comment', default: null },
    content: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

commentSchema.index({ post: 1, createdAt: 1 });
commentSchema.index({ parentComment: 1, createdAt: 1 });

const Comment = mongoose.model('Comment', commentSchema);

module.exports = Comment;