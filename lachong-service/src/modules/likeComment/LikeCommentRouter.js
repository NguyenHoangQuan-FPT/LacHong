const express = require('express');
const router = express.Router();
const LikeCommentService = require('./LikeCommentService');
const verifyCustomerToken = require('../../services/middleware');

router.post('/likeComment/:commentId', verifyCustomerToken, LikeCommentService.addLikeComment);
router.delete('/likeComment/:commentId', verifyCustomerToken, LikeCommentService.removeLikeComment);
router.get('/likeComments/:commentId', LikeCommentService.getLikeCommentsByCommentId);

module.exports = router;