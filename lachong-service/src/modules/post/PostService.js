const Post = require('../../models/model/Post');
const Customer = require('../../models/model/Customer');

exports.getAllPosts = async (req, res) => {
    try {
        const posts = await Post.find().populate('customer', 'fullName').lean().exec();
        res.status(200).json({
            message: "Posts retrieved successfully.",
            posts
        });
    } catch (error) {
        console.error("Error getting all posts:", error);
        res.status(500).json({ message: "Internal server error." });
    }
}

exports.createPost = async (req, res) => {
    try {
        const accountId = req.user?.id;

        if (!accountId) {
            return res.status(401).json({ message: "Unauthorized." });
        }

        const { title, content } = req.body;

        if (!title || title.trim() === "") {
            return res.status(400).json({ message: "Title cannot be empty." });
        }
        if (!content || content.trim() === "") {
            return res.status(400).json({ message: "Content cannot be empty." });
        }

        const image = req.file ? req.file.path : null;

        const customer = await Customer.findOne({ accountId });
        if (!customer) {
            return res.status(404).json({ message: "Customer not found." });
        }
        const newPost = new Post({
            customer: customer._id,
            title,
            image,
            content,
            createdAt: new Date(),
            updatedAt: new Date()
        });
        await newPost.save();
        res.status(201).json({
            message: "Post created successfully.",
            post: newPost
        });
    } catch (error) {
        console.error("Error creating post:", error);
        res.status(500).json({ message: "Internal server error." });
    }
}

exports.updatePost = async (req, res) => {
    try {
        const { id } = req.params;
        const accountId = req.user?.id;

        if (!accountId) {
            return res.status(401).json({ message: "Unauthorized." });
        }
        const post = await Post.findById(id);
        if (!post) {
            return res.status(404).json({ message: "Post not found." });
        }

        const customer = await Customer.findOne({ accountId });
        if (!customer) {
            return res.status(404).json({ message: "Customer not found." });
        }

        if (String(post.customer) !== String(customer._id)) {
            return res.status(403).json({ message: "You can only update your own post." });
        }

        const { title, content } = req.body;
        if (title !== undefined) post.title = title;
        if (content !== undefined) post.content = content;
        if (req.file) {
            post.image = req.file.path;
        }
        post.updatedAt = new Date();
        await post.save();

        res.status(200).json({
            message: "Post updated successfully.",
            post
        });
    } catch (error) {
        console.error("Error updating post:", error);
        res.status(500).json({ message: "Internal server error." });
    }
}

exports.deletePost = async (req, res) => {
    try {
        const { id } = req.params;
        const accountId = req.user?.id;

        if (!accountId) {
            return res.status(401).json({ message: "Unauthorized." });
        }
        const post = await Post.findById(id);
        if (!post) {
            return res.status(404).json({ message: "Post not found." });
        }

        const customer = await Customer.findOne({ accountId });
        if (!customer) {
            return res.status(404).json({ message: "Customer not found." });
        }

        if (String(post.customer) !== String(customer._id)) {
            return res.status(403).json({ message: "You can only delete your own post." });
        }

        await Post.findByIdAndDelete(id);

        res.status(200).json({
            message: "Post deleted successfully."
        });
    } catch (error) {
        console.error("Error deleting post:", error);
        res.status(500).json({ message: "Internal server error." });
    }
}