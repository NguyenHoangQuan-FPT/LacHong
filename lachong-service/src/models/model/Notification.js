const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'Account', required: true },
    order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: { type: String, enum: ['ORDER', 'PROMOTION', 'SYSTEM'] },
    isRead: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Notification', notificationSchema);
