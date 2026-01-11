const mongoose = require('mongoose');

const ChatRoomSchema = new mongoose.Schema({
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
    store: { type: mongoose.Schema.Types.ObjectId, ref: 'Store', required: true },
},
    { timestamps: true });

module.exports = mongoose.model('ChatRoom', ChatRoomSchema);