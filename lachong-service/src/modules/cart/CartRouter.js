const express = require('express');
const router = express.Router();
const CartService = require('./CartService');
const verifyCustomerToken = require('../../services/middleware');

router.post('/cart', verifyCustomerToken, CartService.addToCart);
router.put('/cart', verifyCustomerToken, CartService.updateQuantity);
router.delete('/cart', verifyCustomerToken, CartService.removeItem);
router.delete('/cart/all', verifyCustomerToken, CartService.removeAllCartItems);
router.get('/cart', verifyCustomerToken, CartService.getCartItems);

module.exports = router;