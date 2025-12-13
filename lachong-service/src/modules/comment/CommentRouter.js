const express = require('express');
const router = express.Router();
const CommentService = require('./CommentService');
const verifyCustomerToken = require('../../services/middleware');

router.get('/comments/:postId', CommentService.getCommentsByPostId);
router.post('/comment', verifyCustomerToken, CommentService.addComment);
router.put('/comment/:id', verifyCustomerToken, CommentService.updateComment);
router.delete('/comment/:id', verifyCustomerToken, CommentService.deleteComment);

module.exports = router;