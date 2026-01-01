const Product = require('../../models/model/Product');


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
        const relatedProducts = await Product.find({
            category: categoryId,
            _id: { $ne: productId },
            status: true
        }).limit(4).lean().exec();

        res.status(200).json({
            message: "Related products retrieved successfully.",
            relatedProducts
        });
    } catch (error) {
        console.error("Error getting related products:", error);
        res.status(500).json({ message: "Internal server error." });
    }
}