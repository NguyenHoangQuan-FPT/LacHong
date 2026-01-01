const LikeComment = require('../../models/model/LikeCommennt');
const Comment = require('../../models/model/Comment');
const Customer = require('../../models/model/Customer');
const Store = require('../../models/model/Store');

exports.addLikeComment = async (req, res) => {
    try {
        const { commentId } = req.params;
        const accountId = req.user?.id;
        if (!accountId) {
            return res.status(401).json({ message: "Unauthorized." });
        }
        let customer = null;
        let store = null;
        const role = req.user?.role;

        if (role === 'customer') {
            customer = await Customer.findOne({ accountId });
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

        const comment = await Comment.findById(commentId);
        if (!comment) {
            return res.status(404).json({ message: "Comment not found." });
        }
        const existingLikeComment = await LikeComment.findOne({ comment: commentId, customer: customer?._id, store: store ? store._id : null });
        if (existingLikeComment) {
            return res.status(400).json({ message: "You have already liked this comment." });
        }
        const newLikeComment = new LikeComment({
            store: store ? store._id : null,
            comment: commentId,
            customer: customer?._id
        });
        await newLikeComment.save();
        res.status(201).json({
            message: "Like on comment added successfully.",
            likeComment: newLikeComment
        });
    } catch (error) {
        res.status(500).json({ message: "An error occurred while adding like on comment.", error: error.message });
    }
}

exports.removeLikeComment = async (req, res) => {
    try {
        const { commentId } = req.params;
        const accountId = req.user?.id;
        if (!accountId) {
            return res.status(401).json({ message: "Unauthorized." });
        }
        let customer = null;
        let store = null;
        const role = req.user?.role;

        if (role === 'customer') {
            customer = await Customer.findOne({ accountId });
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

        const comment = await Comment.findById(commentId);
        if (!comment) {
            return res.status(404).json({ message: "Comment not found." });
        }

        await LikeComment.deleteOne({ _id: commentId, customer: customer?._id, store: store ? store._id : null });
        res.status(200).json({ message: "Like on comment removed successfully." });
    } catch (error) {
        res.status(500).json({ message: "An error occurred while removing like on comment.", error: error.message });
    }
}

exports.getLikeCommentsByCommentId = async (req, res) => {
    try {
        const { commentId } = req.params;
        const likeComments = await LikeComment.find({ comment: commentId });
        res.status(200).json({ likeComments });
    } catch (error) {
        res.status(500).json({ message: "An error occurred while retrieving like comments.", error: error.message });
    }
}