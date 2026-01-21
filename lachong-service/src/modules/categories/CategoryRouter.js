const express = require('express');
const router = express.Router();
const CategoryService = require('../categories/CategoryService');
const verifyToken = require('../../services/middleware');


router.get('/categories', CategoryService.getAllCategories);
router.get('/categories/admin', verifyToken, CategoryService.getCategories);
router.post('/categories', verifyToken, CategoryService.createCategory);
router.put('/categories/admin/:id', verifyToken, CategoryService.updateCategory);

module.exports = router;