const { number } = require('joi');
const Review = require('../../models/model/Review');
const Customer = require('../../models/model/Customer');

exports.getReviewsByProductId = async (req, res) => {
    const { productId } = req.params;
    try {
        const reviews = await Review.find({ product: productId, status: true })
            .populate('customer', 'fullName ')
            .lean()
            .exec();
        res.status(200).json({
            message: "Reviews retrieved successfully.",
            reviews
        });
    } catch (error) {
        console.error(`Error getting reviews for product ID ${productId}:`, error);
        res.status(500).json({ message: "Internal server error." });
    }
}

exports.addReview = async (req, res) => {
    const accountId = req.user?.id;

    if (!accountId) {
        return res.status(401).json({ message: "Unauthorized." });
    }

    const { product, rating, comment } = req.body;

    if (typeof rating !== 'number' || rating < 1 || rating > 5) {
        return res.status(400).json({ message: "Rating must be a number between 1 and 5." });
    }
    if (!comment || comment.trim() === "") {
        return res.status(400).json({ message: "Comment cannot be empty." });
    }

    const customer = await Customer.findOne({ accountId });
    if (!customer) {
        return res.status(404).json({ message: "Customer not found." });
    }
    try {
        const newReview = new Review({
            product,
            customer: customer._id,
            rating,
            comment,
            status: true,
            createdAt: new Date()
        });
        await newReview.save();
        res.status(201).json({
            message: "Review added successfully.",
            review: newReview
        });
    } catch (error) {
        console.error("Error adding review:", error);
        res.status(500).json({ message: "Internal server error." });
    }
}

exports.updateReview = async (req, res) => {
    try {
        const accountId = req.user?.id;
        if (!accountId) {
            return res.status(401).json({ message: "Unauthorized." });
        }
        const customer = await Customer.findOne({ accountId });
        if (!customer) {
            return res.status(404).json({ message: "Customer not found." });
        }

        const { id } = req.params;
        const { rating, comment } = req.body;

        const review = await Review.findById(id);
        if (!review) {
            return res.status(404).json({ message: "Review not found." });
        }

        if (String(review.customer) !== String(customer._id)) {
            return res.status(403).json({ message: "You can only update your own review." });
        }

        review.rating = rating !== undefined ? rating : review.rating;
        review.comment = comment !== undefined ? comment : review.comment;
        review.updatedAt = new Date();
        await review.save();

        res.status(200).json({
            message: "Review updated successfully.",
            review
        });

    } catch (error) {
        console.error("Error updating review:", error);
        res.status(500).json({ message: "Internal server error." });
    }
}

exports.deleteReview = async (req, res) => {
    try {
        const accountId = req.user?.id;
        if (!accountId) {
            return res.status(401).json({ message: "Unauthorized." });
        }
        const customer = await Customer.findOne({ accountId });
        if (!customer) {
            return res.status(404).json({ message: "Customer not found." });
        }

        const { id } = req.params;

        const review = await Review.findById(id);
        if (!review) {
            return res.status(404).json({ message: "Review not found." });
        }

        // Only the owner of the review can delete it
        if (String(review.customer) !== String(customer._id)) {
            return res.status(403).json({ message: "You can only delete your own review." });
        }

        await Review.findByIdAndDelete(id);

        res.status(200).json({
            message: "Review deleted successfully."
        });

    } catch (error) {
        console.error("Error deleting review:", error);
        res.status(500).json({ message: "Internal server error." });
    }
} 