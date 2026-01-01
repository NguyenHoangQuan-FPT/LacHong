const Like = require('../../models/model/Like');
const Post = require('../../models/model/Post');
const Customer = require('../../models/model/Customer');
const Store = require('../../models/model/Store');

exports.addLike = async (req, res) => {
    try {
        const { postId } = req.params;
        const accountId = req.user?.id;

        if (!accountId) {
            return res.status(401).json({ message: "Unauthorized." });
        }

        let customer = null;
        let store = null;
        const role = req.user?.role;

        if (role === 'customer') {
            customer = await Customer.findOne({ accountId: accountId });
            if (!customer) {
                return res.status(404).json({ message: "Customer not found." });
            }
        } else if (role === 'manager') {
            store = await Store.findOne({ ownerId: accountId });
            if (!store) {
                return res.status(404).json({ message: "Store not found." });
            }
        } else {
            return res.status(400).json({ message: "Invalid role." });
        }


        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ message: "Post not found." });
        }

        const likeQuery = { post: postId };
        if (customer) likeQuery.customer = customer._id;
        if (store) likeQuery.store = store._id;

        const existingLike = await Like.findOne(likeQuery);
        if (existingLike) {
            return res.status(400).json({ message: "You have already liked this post." });
        }

        const newLikeData = { post: postId };
        if (customer) newLikeData.customer = customer._id;
        if (store) newLikeData.store = store._id;

        const newLike = new Like(newLikeData);

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

        let customer = null;
        let store = null;
        const role = req.user?.role;

        if (role === 'customer') {
            customer = await Customer.findOne({ accountId: accountId });
            if (!customer) {
                return res.status(404).json({ message: "Customer not found." });
            }
        } else if (role === 'manager') {
            store = await Store.findOne({ ownerId: accountId });
            if (!store) {
                return res.status(404).json({ message: "Store not found." });
            }
        } else {
            return res.status(400).json({ message: "Invalid role." });
        }

        const like = await Like.findOne({ post: postId, customer: customer?._id, store: store ? store._id : null });
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