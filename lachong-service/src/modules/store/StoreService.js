const Store = require('../../models/model/Store');
const StoreDTO = require('../../models/DTOs/StoreDTO');
const Category = require('../../models/model/Category');
const Material = require('../../models/model/Material');
const Product = require('../../models/model/Product');
const ProductDTO = require('../../models/DTOs/ProductDTO');

exports.getProfileStore = async (req, res) => {
    try {
        const store = await Store.findOne({ ownerId: req.user.id });
        if (!store) {
            return res.status(404).json({ message: "Store not found." });
        }

        res.status(200).json({
            message: "Store profile retrieved successfully.",
            store
        });
    } catch (error) {
        console.error("Error getting store profile:", error);
        res.status(500).json({ message: "Internal server error." });
    }
};

exports.getProductsByStore = async (req, res) => {
    try {
        const store = await Store.findOne({ ownerId: req.user.id });
        if (!store) {
            return res.status(404).json({ message: "Store not found." });
        }

        const products = await Product.find({ storeId: store._id });

        res.status(200).json({
            message: "Products retrieved successfully.",
            products
        });
    } catch (error) {
        console.error("Error getting products by store:", error);
        res.status(500).json({ message: "Internal server error." });
    }
}

exports.getProductById = async (req, res) => {
    try {
        const { id } = req.params;

        const store = await Store.findOne({ ownerId: req.user.id });
        if (!store) {
            return res.status(404).json({ message: "Store not found." });
        }

        const product = await Product.findOne({ _id: id, storeId: store._id }).populate('category').populate('material');
        if (!product) {
            return res.status(404).json({ message: "Product not found or you do not have permission to view this product." });
        }

        res.status(200).json({
            message: "Product retrieved successfully.",
            product
        });
    } catch (error) {
        console.error("Error getting product by id:", error);
        res.status(500).json({ message: "Internal server error." });
    }
}

exports.updateProfileStore = async (req, res) => {
    try {

        const { error, value } = StoreDTO.validate(req.body);
        if (error) {
            return res.status(400).json({ message: error.details[0].message });
        }

        const store = await Store.findOne({ ownerId: req.user.id });
        if (!store) {
            return res.status(404).json({ message: "Store not found." });
        }

        const allowedFields = ["storeName", "emailStore", "address", "phone", "policy", "typeStoreId"];
        allowedFields.forEach(field => {
            if (value[field] !== undefined) {
                store[field] = value[field];
            }
        });

        if (value.facebook !== undefined) store.socialMedia.facebook = value.facebook;
        if (value.instagram !== undefined) store.socialMedia.instagram = value.instagram;
        if (value.twitter !== undefined) store.socialMedia.twitter = value.twitter;

        if (req.file && req.file.path) {
            store.avatar = req.file.path;
        }

        await store.save();

        res.status(200).json({
            message: "Store profile updated successfully.",
            store
        });

    } catch (error) {
        console.error("Update profile error:", error);
        res.status(500).json({ message: "Internal server error." });
    }
};

exports.createProductByStore = async (req, res) => {
    try {
        const store = await Store.findOne({ ownerId: req.user.id });
        if (!store) {
            return res.status(404).json({ message: "Store not found." });
        }

        const storeId = store._id;

        const { error, value } = ProductDTO.validate(req.body);
        if (error) {
            return res.status(400).json({ message: error.details[0].message });
        }

        const checkCategory = await Category.findById(value.category);
        if (!checkCategory) {
            return res.status(400).json({ message: "Category not found." });
        }

        const checkMaterial = await Material.findById(value.material);
        if (!checkMaterial) {
            return res.status(400).json({ message: "Material not found." });
        }

        const files = req.files || [];
        const imageUrls = files.map(f => f.path);

        const mainImageUrl = imageUrls[0] || "";

        const newProduct = new Product({
            productName: value.productName,
            description: value.description,
            price: value.price,
            stock: value.stock,
            discountPercent: value.discountPercent,
            category: value.category,
            material: value.material,
            storeId: storeId,
            imageUrl: mainImageUrl,
            images: imageUrls,
        });

        await newProduct.save();

        res.status(201).json({
            message: "Product created successfully.",
            product: newProduct
        });

    } catch (error) {
        console.error("Error creating product:", error);
        res.status(500).json({ message: "Internal server error." });
    }
};

exports.updateProductByStore = async (req, res) => {
    try {
        const { id } = req.params;

        const store = await Store.findOne({ ownerId: req.user.id });
        if (!store) {
            return res.status(404).json({ message: "Store not found." });
        }
        const { error, value } = ProductDTO.validate(req.body);
        if (error) {
            return res.status(400).json({ message: error.details[0].message });
        }

        const updateProduct = await Product.findOneAndUpdate(
            { _id: id, storeId: store._id },
            { $set: value },
            { new: true }
        );

        if (!updateProduct) {
            return res.status(404).json({ message: "Product not found or you do not have permission to update this product." });
        }

        res.status(200).json({
            message: "Product updated successfully.",
            product: updateProduct
        });

    } catch (error) {
        console.error("Error updating product:", error);
        res.status(500).json({ message: "Internal server error." });
    }
}
exports.deleteProductByStore = async (req, res) => {
    try {
        const { id } = req.params;

        const store = await Store.findOne({ ownerId: req.user.id });
        if (!store) {
            return res.status(404).json({ message: "Store not found." });
        }

        const deletedProduct = await Product.findOneAndDelete({ _id: id, storeId: store._id });

        if (!deletedProduct) {
            return res.status(404).json({ message: "Product not found or you do not have permission to delete this product." });
        }

        res.status(200).json({
            message: "Product deleted successfully."
        });
    } catch (error) {
        console.error("Error deleting product:", error);
        res.status(500).json({ message: "Internal server error." });
    }
}