const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
    store: { type: mongoose.Schema.Types.ObjectId, ref: 'Store' },
    title: { type: String },
    images: [{ type: String }],
    content: { type: String, required: true },
    comment: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }],
    like: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Like' }],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

const Post = mongoose.model('Post', postSchema);

module.exports = Post;
