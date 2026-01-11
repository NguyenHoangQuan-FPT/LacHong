const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
    room: { type: mongoose.Schema.Types.ObjectId, ref: 'ChatRoom', required: true },
    senderId: { type: mongoose.Schema.Types.ObjectId, required: true },
    senderRole: { type: String, enum: ['customer', 'manager'], required: true },
    images: { type: [String], default: [] },
    content: { type: String },
    isRead: { type: Boolean, default: false },
    timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Message', MessageSchema);