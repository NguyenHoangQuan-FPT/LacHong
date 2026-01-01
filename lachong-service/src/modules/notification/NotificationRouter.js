const express = require('express');
const router = express.Router();
const notificationController = require('./NotificationService');
const verifyToken = require('../../services/middleware');

router.post('/notification/send', notificationController.sendNotification);
router.get('/notifications', verifyToken, notificationController.getNotifications);
router.get('/notifications/isread', verifyToken, notificationController.getNotificationIsRead);
router.patch('/notification/:id/', verifyToken, notificationController.markAsRead);

module.exports = router;