const Account = require('../../models/model/Account');
const Notification = require('../../models/model/Notification');

exports.sendNotification = async (req, res) => {
    try {
        const { receiver, title, message, type } = req.body;

        const receiverAccount = await Account.findById(receiver);

        if (!receiverAccount) {
            return res.status(404).json({ message: 'Receiver not found' });
        }

        const notification = new Notification({
            receiver: receiverAccount._id,
            title,
            message,
            type
        });

        await notification.save();

        return res.status(201).json({ message: 'Notification sent successfully', notification });
    } catch (error) {
        return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
}

exports.getNotifications = async (req, res) => {
    try {
        const accountId = req.user?.id;

        if (!accountId) {
            return res.status(401).json({ message: 'You must be logged in to view notifications' });
        }

        const notifications = await Notification.find({ receiver: accountId }).sort({ createdAt: -1 });

        return res.status(200).json({ notifications });
    } catch (error) {
        return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
}

exports.getNotificationIsRead = async (req, res) => {
    try {
        const accountId = req.user?.id;

        if (!accountId) {
            return res.status(401).json({ message: 'You must be logged in to view notifications' });
        }

        const notifications = await Notification.find({ receiver: accountId, isRead: false }).sort({ createdAt: -1 });

        return res.status(200).json({ notifications });
    } catch (error) {
        return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
}

exports.markAsRead = async (req, res) => {
    try {
        const accountId = req.user?.id;

        if (!accountId) {
            return res.status(401).json({ message: 'You must be logged in to mark notifications as read' });
        }
        const { id } = req.params;

        const { isRead } = req.body;

        const notification = await Notification.findByIdAndUpdate(
            id,
            { isRead: isRead },
            { new: true }
        );

        return res.status(200).json({ message: 'Notification marked as read', notification });
    } catch (error) {
        return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
}