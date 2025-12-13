const express = require('express');
const router = express.Router();
const PostService = require('./PostService');
const upload = require('../../config/multer');
const verifyCustomerToken = require('../../services/middleware');

router.get('/posts', PostService.getAllPosts);
router.post('/post', verifyCustomerToken, upload.single('image'), PostService.createPost);
router.put('/post/:id', verifyCustomerToken, upload.single('image'), PostService.updatePost);
router.delete('/post/:id', verifyCustomerToken, PostService.deletePost);

module.exports = router;
