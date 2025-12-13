const Comment = require('../../models/model/Comment');
const Post = require('../../models/model/Post');
const Customer = require('../../models/model/Customer');

exports.addComment = async (req, res) => {
    const { postId, content } = req.body;
    const accountId = req.user?.id;

    if (!accountId) {
        return res.status(401).json({ message: "Unauthorized." });
    }

    try {
        const customer = await Customer.findOne({ accountId });
        if (!customer) {
            return res.status(404).json({ message: "Customer not found." });
        }

        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ message: "Post not found." });
        }

        const newComment = new Comment({
            post: postId,
            customer: customer._id,
            content
        });

        await newComment.save();

        res.status(201).json({
            message: "Comment added successfully.",
            comment: newComment
        });
    } catch (error) {
        console.error("Error adding comment:", error);
        res.status(500).json({ message: "Internal server error." });
    }
}

exports.getCommentsByPostId = async (req, res) => {
    try {
        const { postId } = req.params;
        const comments = await Comment.find({ post: postId })
            .populate('customer', 'fullName avatar')
            .lean()
            .exec();

        res.status(200).json({
            message: "Comments retrieved successfully.",
            comments
        });
    } catch (error) {
        console.error("Error getting comments:", error);
        res.status(500).json({ message: "Internal server error." });
    }
}

exports.deleteComment = async (req, res) => {
    try {
        const { id } = req.params;
        const accountId = req.user?.id;

        if (!accountId) {
            return res.status(401).json({ message: "Unauthorized." });
        }

        const customer = await Customer.findOne({ accountId });
        if (!customer) {
            return res.status(404).json({ message: "Customer not found." });
        }

        const comment = await Comment.findById(id);
        if (!comment) {
            return res.status(404).json({ message: "Comment not found." });
        }

        // Only the owner of the comment can delete it
        if (String(comment.customer) !== String(customer._id)) {
            return res.status(403).json({ message: "You can only delete your own comment." });
        }

        await Comment.findByIdAndDelete(id);

        res.status(200).json({
            message: "Comment deleted successfully."
        });
    } catch (error) {
        console.error("Error deleting comment:", error);
        res.status(500).json({ message: "Internal server error." });
    }
}

exports.updateComment = async (req, res) => {
    try {
        const { id } = req.params;
        const { content } = req.body;
        const accountId = req.user?.id;

        if (!accountId) {
            return res.status(401).json({ message: "Unauthorized." });
        }

        const customer = await Customer.findOne({ accountId });
        if (!customer) {
            return res.status(404).json({ message: "Customer not found." });
        }

        const comment = await Comment.findById(id);
        if (!comment) {
            return res.status(404).json({ message: "Comment not found." });
        }

        // Only the owner of the comment can update it
        if (String(comment.customer) !== String(customer._id)) {
            return res.status(403).json({ message: "You can only update your own comment." });
        }

        comment.content = content !== undefined ? content : comment.content;
        comment.updatedAt = new Date();
        await comment.save();

        res.status(200).json({
            message: "Comment updated successfully.",
            comment
        });
    } catch (error) {
        res.status(500).json({ message: "Internal server error." });
        console.error("Error updating comment:", error);
    }
}