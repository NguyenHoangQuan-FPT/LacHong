const Product = require('../../models/model/Product');


exports.getAllProducts = async (req, res) => {
    try {
        const products = await Product.find().populate('storeId').lean().exec();
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
        res.status(200).json({
            message: "Product retrieved successfully.",
            product
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
            _id: { $ne: productId }
        }).limit(10).lean().exec();

        res.status(200).json({
            message: "Related products retrieved successfully.",
            relatedProducts
        });
    } catch (error) {
        console.error("Error getting related products:", error);
        res.status(500).json({ message: "Internal server error." });
    }
}