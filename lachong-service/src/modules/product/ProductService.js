const Product = require('../../models/model/Product');
const mongoose = require('mongoose');


const Review = require('../../models/model/Review');

exports.getAllProducts = async (req, res) => {
    try {
        let products = await Product.find({ status: true }).populate('storeId').lean().exec();
        products = products.filter(p => p.storeId && (p.storeId.status === 'ACTIVE'));

        const productIds = products.map(p => p._id);
        const reviews = await Review.aggregate([
            { $match: { product: { $in: productIds } } },
            { $group: { _id: "$product", avgRating: { $avg: "$rating" } } }
        ]);
        const ratingMap = {};
        reviews.forEach(r => { ratingMap[r._id.toString()] = r.avgRating; });
        products = products.map(p => ({
            ...p,
            reviews: ratingMap[p._id.toString()] || 0
        }));

        products.sort((a, b) => {
            if (b.reviews !== a.reviews) return b.reviews - a.reviews;
            return (b.sold || 0) - (a.sold || 0);
        });

        res.status(200).json({
            message: "Products retrieved successfully.",
            products
        });
    } catch (error) {
        console.error("Error getting all products:", error);
        res.status(500).json({ message: "Internal server error." });
    }
}

exports.getProductById = async (req, res) => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: "Invalid product id." });
    }
    try {
        const product = await Product.findById(id).populate('storeId').populate('category').populate('material').lean().exec();
        if (!product) {
            return res.status(404).json({ message: "Product not found." });
        }

        const reviews = await Review.aggregate([
            { $match: { product: product._id } },
            { $group: { _id: "$product", avgRating: { $avg: "$rating" } } }
        ]);
        let avgRating = 0;
        if (reviews.length > 0) avgRating = reviews[0].avgRating;

        res.status(200).json({
            message: "Product retrieved successfully.",
            product: {
                ...product,
                avgRating
            }
        });
    } catch (error) {
        console.error(`Error getting product by ID ${id}:`, error);
        res.status(500).json({ message: "Internal server error." });
    }
}

exports.getRelatedProducts = async (req, res) => {
    try {
        const { categoryId, productId } = req.params;
        let relatedProducts = await Product.find({
            status: true,
            category: categoryId,
            _id: { $ne: productId },
        })
            .populate({ path: 'storeId', match: { status: 'ACTIVE' } })
            .limit(4)
            .lean()
            .exec();

        relatedProducts = relatedProducts.filter(p => p.storeId && p.storeId.status === 'ACTIVE');

        res.status(200).json({
            message: "Related products retrieved successfully.",
            relatedProducts
        });
    } catch (error) {
        console.error("Error getting related products:", error);
        res.status(500).json({ message: "Internal server error." });
    }
}

exports.getNewProducts = async (req, res) => {
    try {
        let newProducts = await Product.find({ status: true })
            .populate({ path: 'storeId', match: { status: 'ACTIVE' } })
            .sort({ createdAt: -1 })
            .limit(10)
            .lean()
            .exec();

        newProducts = newProducts.filter(p => p.storeId && p.storeId.status === 'ACTIVE');

        res.status(200).json({
            message: "New products retrieved successfully.",
            newProducts
        });
    } catch (error) {
        console.error("Error getting new products:", error);
        res.status(500).json({ message: "Internal server error." });
    }
}

exports.getDiscountedProducts = async (req, res) => {
    try {
        let discountedProducts = await Product.find({ status: true, discountPercent: { $gt: 0 } })
            .populate({ path: 'storeId', match: { status: 'ACTIVE' } })
            .sort({ discountPercent: -1, createdAt: -1 })
            .limit(10)
            .lean()
            .exec();

        discountedProducts = discountedProducts.filter(p => p.storeId && p.storeId.status === 'ACTIVE');

        res.status(200).json({
            message: "Top discounted products retrieved successfully.",
            discountedProducts
        });
    } catch (error) {
        console.error("Error getting top discounted products:", error);
        res.status(500).json({ message: "Internal server error." });
    }
}

exports.getBestSellingProducts = async (req, res) => {
    try {
        let bestSellingProducts = await Product.find({ status: true })
            .populate({ path: 'storeId', match: { status: 'ACTIVE' } })
            .sort({ sold: -1, createdAt: -1 })
            .limit(10)
            .lean()
            .exec();

        bestSellingProducts = bestSellingProducts.filter(p => p.storeId && p.storeId.status === 'ACTIVE');

        res.status(200).json({
            message: "Best-selling products retrieved successfully.",
            bestSellingProducts
        });
    } catch (error) {
        console.error("Error getting best-selling products:", error);
        res.status(500).json({ message: "Internal server error." });
    }
}