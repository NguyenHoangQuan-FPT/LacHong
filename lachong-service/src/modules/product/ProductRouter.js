const express = require('express');
const router = express.Router();
const ProductService = require('../product/ProductService');

router.get('/products', ProductService.getAllProducts);
router.get('/products/:id', ProductService.getProductById);

module.exports = router;