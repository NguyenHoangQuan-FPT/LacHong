const Category = require('../../models/model/Category');

exports.getAllCategories = async (req, res) => {
    try {
        const categories = await Category.find();
        res.status(200).json({
            message: "Categories retrieved successfully.",
            categories
        });
    } catch (error) {
        console.error("Error getting all categories:", error);
        res.status(500).json({ message: "Internal server error." });
    }
}

