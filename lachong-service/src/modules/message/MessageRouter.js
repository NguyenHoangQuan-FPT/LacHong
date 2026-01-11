const express = require('express');
const router = express.Router();
const MessageService = require('../message/MessageService');
const verifyToken = require('../../services/middleware');
const upload = require('../../config/multer');


router.get('/chatrooms/:roomId/messages', verifyToken, MessageService.getMessages);
router.post('/messages', verifyToken, upload.array('images', 10), MessageService.sendMessage);
router.get('/chatrooms/store', verifyToken, MessageService.getRoomByStore);
router.get('/chatrooms/customer', verifyToken, MessageService.getRoomByCustomer);

module.exports = router;