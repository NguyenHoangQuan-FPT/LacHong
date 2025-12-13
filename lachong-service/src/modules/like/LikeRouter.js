const express = require('express');
const router = express.Router();
const LikeService = require('./LikeService');
const verifyCustomerToken = require('../../services/middleware');

router.post('/like/:postId', verifyCustomerToken, LikeService.addLike);
router.delete('/like/:postId', verifyCustomerToken, LikeService.removeLike);
router.get('/likes/:postId', LikeService.getLikesByPostId);

module.exports = router;