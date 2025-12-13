const express = require('express');
const router = express.Router();
const ReviewService = require('../review/ReviewService');
const verifyCustomerToken = require('../../services/middleware');

router.get('/reviews/:productId', ReviewService.getReviewsByProductId);
router.post('/review', verifyCustomerToken, ReviewService.addReview);
router.put('/review/:id', verifyCustomerToken, ReviewService.updateReview);
router.delete('/review/:id', verifyCustomerToken, ReviewService.deleteReview);

module.exports = router;