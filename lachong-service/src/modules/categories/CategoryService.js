const Category = require('../../models/model/Category');

exports.getAllCategories = async (req, res) => {
    try {
        const categories = await Category.find({ status: true });

        res.status(200).json({
            message: "Categories retrieved successfully.",
            categories
        });
    } catch (error) {
        console.error("Error getting all categories:", error);
        res.status(500).json({ message: "Internal server error." });
    }
}

exports.getCategories = async (req, res) => {
    try {
        const accountId = req.user?.id;
        if (!accountId) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const role = req.user?.role;

        if (role !== 'admin') {
            return res.status(403).json({ message: "Forbidden: Admins only." });
        }
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

exports.createCategory = async (req, res) => {
    try {
        const accountId = req.user?.id;
        if (!accountId) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const role = req.user?.role;
        if (role !== 'admin') {
            return res.status(403).json({ message: "Forbidden: Admins only." });
        }

        const { name, description } = req.body;

        const newCategory = new Category({
            name,
            description,
        });
        await newCategory.save();

        res.status(201).json({
            message: "Category created successfully.",
            category: newCategory
        });
    } catch (error) {
        console.error("Error creating category:", error);
        res.status(500).json({ message: "Internal server error." });
    }
}

exports.updateCategory = async (req, res) => {
    try {
        const accountId = req.user?.id;
        if (!accountId) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const role = req.user?.role;
        if (role !== 'admin') {
            return res.status(403).json({ message: "Forbidden: Admins only." });
        }

        const categoryId = req.params.id;
        const { name, description, status } = req.body;

        const category = await Category.findById(categoryId);
        if (!category) {
            return res.status(404).json({ message: "Category not found." });
        }

        category.name = name !== undefined ? name : category.name;
        category.description = description !== undefined ? description : category.description;
        category.status = status !== undefined ? status : category.status;

        await category.save();

        res.status(200).json({
            message: "Category updated successfully.",
            category
        });
    } catch (error) {
        console.error("Error updating category:", error);
        res.status(500).json({ message: "Internal server error." });
    }
}