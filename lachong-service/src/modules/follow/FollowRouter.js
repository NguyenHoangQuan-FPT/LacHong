const express = require('express');
const router = express.Router();
const FollowService = require('./FollowService');
const verifyCustomerToken = require('../../services/middleware');

router.post('/follow/store', verifyCustomerToken, FollowService.followStore);
router.post('/unfollow/store', verifyCustomerToken, FollowService.unfollowStore);
router.get('/follows/:storeId', FollowService.getFollowingByStore);
router.get('/follows', verifyCustomerToken, FollowService.getFollowingStores);

module.exports = router;