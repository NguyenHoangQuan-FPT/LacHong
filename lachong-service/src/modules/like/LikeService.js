const Like = require('../../models/model/Like');
const Post = require('../../models/model/Post');
const Customer = require('../../models/model/Customer');

exports.addLike = async (req, res) => {
    try {
        const { postId } = req.params;
        const accountId = req.user?.id;

        if (!accountId) {
            return res.status(401).json({ message: "Unauthorized." });
        }

        const customer = await Customer.findOne({ accountId });
        if (!customer) {
            return res.status(404).json({ message: "Customer not found." });
        }

        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ message: "Post not found." });
        }

        const existingLike = await Like.findOne({ post: postId, customer: customer._id });
        if (existingLike) {
            return res.status(400).json({ message: "You have already liked this post." });
        }

        const newLike = new Like({
            post: postId,
            customer: customer._id
        });

        await newLike.save();

        res.status(201).json({
            message: "Like added successfully.",
            like: newLike
        });
    } catch (error) {
        console.error("Error adding like:", error);
        res.status(500).json({ message: "Internal server error." });
    }
}


exports.removeLike = async (req, res) => {
    try {
        const { postId } = req.params;
        const accountId = req.user?.id;

        if (!accountId) {
            return res.status(401).json({ message: "Unauthorized." });
        }

        const customer = await Customer.findOne({ accountId });
        if (!customer) {
            return res.status(404).json({ message: "Customer not found." });
        }

        const like = await Like.findOne({ post: postId, customer: customer._id });
        if (!like) {
            return res.status(404).json({ message: "Like not found." });
        }

        await Like.findByIdAndDelete(like._id);

        res.status(200).json({
            message: "Like removed successfully."
        });
    } catch (error) {
        console.error("Error removing like:", error);
        res.status(500).json({ message: "Internal server error." });
    }
}

exports.getLikesByPostId = async (req, res) => {
    try {
        const { postId } = req.params;
        const likes = await Like.find({ post: postId })
            .populate('customer', 'fullName avatar')
            .lean()
            .exec();
        res.status(200).json({
            message: "Likes retrieved successfully.",
            likes
        });
    } catch (error) {
        console.error("Error getting likes:", error);
        res.status(500).json({ message: "Internal server error." });
    }
} 