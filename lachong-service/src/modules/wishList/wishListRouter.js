const express = require('express');
const router = express.Router();
const WishListService = require('../wishList/wishListService');
const verifyCustomerToken = require('../../services/middleware');

router.get('/wishlist', verifyCustomerToken, WishListService.getWishListByCustomerId);
router.post('/wishlist', verifyCustomerToken, WishListService.addProductToWishList);
router.delete('/wishlist/:productId', verifyCustomerToken, WishListService.removeProductFromWishList);
router.delete('/wishlist', verifyCustomerToken, WishListService.clearWishList);

module.exports = router;