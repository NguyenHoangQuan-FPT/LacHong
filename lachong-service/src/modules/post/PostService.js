const Post = require('../../models/model/Post');
const Customer = require('../../models/model/Customer');
const Store = require('../../models/model/Store');

exports.getAllPosts = async (req, res) => {
    try {
        const posts = await Post.find().populate('customer', 'fullName avatar').populate('store', 'storeName avatar').lean().exec();
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

        const files = req.files || [];
        const images = files.map(f => f.path);

        let customer = null;
        let store = null;
        const role = req.user?.role;

        if (role === "manager") {
            store = await Store.findOne({ ownerId: accountId });
            if (!store) {
                return res.status(404).json({ message: "Store not found for this account." });
            }
        } else if (role === "customer") {
            customer = await Customer.findOne({ accountId: accountId });

        }
        else {
            return res.status(403).json({ message: "Only customers or store managers can create posts." });
        }

        const newPost = new Post({
            customer: customer ? customer._id : undefined,
            store: store ? store._id : undefined,
            title,
            images: images ? images : [],
            content,
            createdAt: new Date(),
            updatedAt: new Date()
        });
        await newPost.save();

        const created = await Post.findById(newPost._id)
            .populate('customer', 'fullName avatar')
            .populate('store', 'storeName address')
            .lean()
            .exec();

        res.status(201).json({
            message: "Post created successfully.",
            post: created || newPost
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
        const role = req.user?.role;

        if (!accountId) {
            return res.status(401).json({ message: "Unauthorized." });
        }
        const post = await Post.findById(id);
        if (!post) {
            return res.status(404).json({ message: "Post not found." });
        }

        let isOwner = false;
        if (role === "manager") {
            const store = await Store.findOne({ ownerId: accountId });
            if (store && String(post.store) === String(store._id)) {
                isOwner = true;
            }
        } else if (role === "customer") {
            const customer = await Customer.findOne({ accountId: accountId });
            if (customer && String(post.customer) === String(customer._id)) {
                isOwner = true;
            }
        }
        if (!isOwner) {
            return res.status(403).json({ message: "You can only update your own post." });
        }

        const { title, content } = req.body;
        let oldImages = [];
        if (req.body.images) {
            try {
                if (typeof req.body.images === 'string') {
                    // Có thể là JSON.stringify([...]) hoặc 1 url string
                    if (req.body.images.startsWith('[')) {
                        oldImages = JSON.parse(req.body.images);
                    } else {
                        oldImages = [req.body.images];
                    }
                } else if (Array.isArray(req.body.images)) {
                    oldImages = req.body.images;
                }
            } catch (e) {
                oldImages = [];
            }
        }
        // Ảnh mới upload
        const files = req.files || [];
        const newImages = files.map(f => f.path);
        // Gộp lại
        post.images = [...oldImages, ...newImages];
        if (title !== undefined) post.title = title;
        if (content !== undefined) post.content = content;
        post.updatedAt = new Date();
        await post.save();

        const updated = await Post.findById(post._id)
            .populate('customer', 'fullName avatar')
            .populate('store', 'storeName avatar')
            .lean()
            .exec();

        res.status(200).json({
            message: "Post updated successfully.",
            post: updated || post
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
        const role = req.user?.role;

        if (!accountId) {
            return res.status(401).json({ message: "Unauthorized." });
        }
        const post = await Post.findById(id);
        if (!post) {
            return res.status(404).json({ message: "Post not found." });
        }

        let isOwner = false;
        if (role === "manager") {
            const store = await Store.findOne({ ownerId: accountId });
            if (store && String(post.store) === String(store._id)) {
                isOwner = true;
            }
        } else if (role === "customer") {
            const customer = await Customer.findOne({ accountId: accountId });
            if (customer && String(post.customer) === String(customer._id)) {
                isOwner = true;
            }
        }
        if (!isOwner) {
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