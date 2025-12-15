const Comment = require('../../models/model/Comment');
const Post = require('../../models/model/Post');
const Customer = require('../../models/model/Customer');

const normalizeId = (value) => {
    if (value === undefined || value === null || value === '') return null;
    return value;
};

const buildCommentTree = (comments) => {
    const byId = new Map();
    const roots = [];

    for (const comment of comments) {
        comment.replies = [];
        byId.set(String(comment._id), comment);
    }

    for (const comment of comments) {
        const parentId = comment.parentComment ? String(comment.parentComment) : null;
        if (parentId && byId.has(parentId)) {
            byId.get(parentId).replies.push(comment);
        } else {
            roots.push(comment);
        }
    }

    return roots;
};

exports.addComment = async (req, res) => {
    const { postId, content } = req.body;
    const parentCommentId = normalizeId(req.body.parentCommentId ?? req.body.parentComment);
    const accountId = req.user?.id;

    if (!accountId) {
        return res.status(401).json({ message: "Unauthorized." });
    }

    try {
        if (!postId) {
            return res.status(400).json({ message: "postId is required." });
        }

        if (!content || String(content).trim() === '') {
            return res.status(400).json({ message: "Content cannot be empty." });
        }

        const customer = await Customer.findOne({ accountId });
        if (!customer) {
            return res.status(404).json({ message: "Customer not found." });
        }

        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ message: "Post not found." });
        }

        let parentComment = null;
        if (parentCommentId) {
            parentComment = await Comment.findById(parentCommentId);
            if (!parentComment) {
                return res.status(404).json({ message: "Parent comment not found." });
            }

            if (String(parentComment.post) !== String(postId)) {
                return res.status(400).json({ message: "Parent comment does not belong to this post." });
            }
        }

        const newComment = new Comment({
            post: postId,
            customer: customer._id,
            parentComment: parentComment ? parentComment._id : null,
            content: String(content).trim()
        });

        await newComment.save();

        const created = await Comment.findById(newComment._id)
            .populate('customer', 'fullName avatar')
            .lean()
            .exec();

        res.status(201).json({
            message: "Comment added successfully.",
            comment: created
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
            .sort({ createdAt: 1 })
            .lean()
            .exec();

        const commentTree = buildCommentTree(comments);

        res.status(200).json({
            message: "Comments retrieved successfully.",
            comments,
            commentTree
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

        // If this comment has replies, soft-delete to avoid orphan threads
        const hasReplies = await Comment.exists({ parentComment: id });
        if (hasReplies) {
            comment.content = 'Bình luận đã bị xoá';
            comment.updatedAt = new Date();
            await comment.save();

            return res.status(200).json({
                message: "Comment deleted successfully."
            });
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