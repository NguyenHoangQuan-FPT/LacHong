const express = require('express');
const router = express.Router();
const ReviewService = require('../review/ReviewService');
const verifyCustomerToken = require('../../services/middleware');
const upload = require('../../config/multer');


router.get('/reviews/:productId', ReviewService.getReviewsByProductId);
router.post('/review', verifyCustomerToken, upload.array("images", 5), ReviewService.addReview);
router.put('/review/:id', verifyCustomerToken, upload.array("images", 5), ReviewService.updateReview);
router.delete('/review/:id', verifyCustomerToken, ReviewService.deleteReview);

module.exports = router;