const express = require('express');
const router = express.Router();
const ProductService = require('../product/ProductService');

router.get('/products', ProductService.getAllProducts);
router.get('/products/new', ProductService.getNewProducts);
router.get('/products/discounted', ProductService.getDiscountedProducts);
router.get('/products/best-selling', ProductService.getBestSellingProducts);
router.get('/products/related/:categoryId/:productId', ProductService.getRelatedProducts);
router.get('/products/:id', ProductService.getProductById);
module.exports = router;