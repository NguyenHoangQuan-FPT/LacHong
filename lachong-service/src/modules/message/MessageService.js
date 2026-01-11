const ChatRoom = require('../../models/model/ChatRoom');
const Message = require('../../models/model/Message');
const Store = require('../../models/model/Store');
const Customer = require('../../models/model/Customer');
const { getIo } = require('../../socket/io');
const mongoose = require('mongoose');


exports.getMessages = async (req, res) => {
    try {
        const accountId = req.user.id;
        if (!accountId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const { roomId } = req.params;
        const messages = await Message.find({ room: roomId }).sort({ timestamp: 1 });
        res.status(200).json(messages);
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
}


exports.sendMessage = async (req, res) => {
    try {
        const accountId = req.user?.id;
        const role = req.user?.role;
        const io = getIo();

        if (!accountId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }


        let { content, roomId, storeId } = req.body;

        if (!roomId || !mongoose.Types.ObjectId.isValid(roomId)) {
            roomId = null;
        }

        const files = req.files || [];
        const imageUrls = files.map(f => f.path);

        if ((!content || content.trim() === "") && imageUrls.length > 0) {
            content = null;
        }

        let senderId;
        let chatRoom;

        if (role === 'customer') {
            const customer = await Customer.findOne({ accountId });
            if (!customer) {
                return res.status(404).json({ error: 'Customer not found' });
            }
            senderId = customer._id;

            if (roomId) {
                chatRoom = await ChatRoom.findById(roomId);
            }

            if (!chatRoom) {
                if (!storeId) {
                    return res.status(400).json({ error: 'Missing storeId' });
                }

                chatRoom = await ChatRoom.findOne({
                    customer: customer._id,
                    store: storeId
                });

                if (!chatRoom) {
                    chatRoom = await ChatRoom.create({
                        customer: customer._id,
                        store: storeId
                    });
                }
            }
        }

        if (role === 'manager') {
            const store = await Store.findOne({ ownerId: accountId });
            if (!store) {
                return res.status(404).json({ error: 'Store not found' });
            }
            senderId = store._id;

            if (!roomId) {
                return res.status(400).json({ error: 'roomId is required' });
            }

            chatRoom = await ChatRoom.findById(roomId);
            if (!chatRoom) {
                return res.status(404).json({ error: 'ChatRoom not found' });
            }
        }

        if (!chatRoom || !chatRoom._id) {
            return res.status(500).json({ error: 'ChatRoom not initialized' });
        }

        const message = await Message.create({
            room: chatRoom._id,
            senderId,
            senderRole: role,
            content,
            images: imageUrls,
        });

        io?.to(chatRoom._id.toString()).emit('receiveMessage', message);

        return res.status(200).json({
            roomId: chatRoom._id,
            message
        });

    } catch (error) {
        console.error('sendMessage error:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};


exports.getRoomByStore = async (req, res) => {
    try {
        const accountId = req.user.id;
        if (!accountId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const store = await Store.findOne({ ownerId: accountId });
        if (!store) {
            return res.status(404).json({ error: 'Store not found' });
        }
        const chatRooms = await ChatRoom.find({
            store: store._id,
        }).populate('customer', 'fullName avatar');
        res.status(200).json(chatRooms);
    } catch (error) {
        console.error('SendMessage error:', error);
        res.status(500).json({ error: 'Internal Server Error', detail: error.message });
    }
}


exports.getRoomByCustomer = async (req, res) => {
    try {
        const accountId = req.user.id;
        if (!accountId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const customer = await Customer.findOne({ accountId: accountId });
        if (!customer) {
            return res.status(404).json({ error: 'Customer not found' });
        }
        const chatRooms = await ChatRoom.find({
            customer: customer._id,
        }).populate('store', 'storeName avatar');
        res.status(200).json(chatRooms);
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
}
