const express = require('express');
const router = express.Router();
const CategoryService = require('../categories/CategoryService');

router.get('/categories', CategoryService.getAllCategories);

module.exports = router;