const Store = require('../../models/model/Store');
const StoreDTO = require('../../models/DTOs/StoreDTO');
const Category = require('../../models/model/Category');
const Material = require('../../models/model/Material');
const Product = require('../../models/model/Product');
const ProductDTO = require('../../models/DTOs/ProductDTO');
const Order = require('../../models/model/Order');
const mongoose = require('mongoose');

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
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'ID không hợp lệ' });
        }
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

        const allowedFields = ["storeName", "emailStore", "address", "phone", "policy", 'description', "typeStoreId"];
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
            policy: value.policy,
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
        const keepImagesRaw = req.body?.keepImages ?? req.body?.images;

        const bodyForValidation = { ...req.body };
        delete bodyForValidation.keepImages;

        // In some clients, "images" may be sent as a helper field for keeping old images.
        // It's not part of ProductDTO, so we strip it out before validating.
        delete bodyForValidation.images;

        const { error, value } = ProductDTO.validate(bodyForValidation, {
            allowUnknown: true,
            stripUnknown: true,
        });
        if (error) {
            return res.status(400).json({ message: error.details[0].message });
        }

        const existingProduct = await Product.findOne({ _id: id, storeId: store._id });
        if (!existingProduct) {
            return res.status(404).json({ message: "Product not found or you do not have permission to update this product." });
        }

        let keptImages = [];
        if (keepImagesRaw != null) {
            try {
                if (typeof keepImagesRaw === 'string') {
                    const s = keepImagesRaw.trim();
                    if (s.startsWith('[')) {
                        keptImages = JSON.parse(s);
                    } else if (s.length > 0) {
                        keptImages = [s];
                    }
                } else if (Array.isArray(keepImagesRaw)) {
                    keptImages = keepImagesRaw;
                }
            } catch {
                keptImages = [];
            }
        } else {
            keptImages = Array.isArray(existingProduct.images) && existingProduct.images.length > 0
                ? existingProduct.images
                : (existingProduct.imageUrl ? [existingProduct.imageUrl] : []);
        }

        const files = req.files || [];
        const newImages = files.map((f) => f.path).filter(Boolean);
        const merged = [...(Array.isArray(keptImages) ? keptImages : []), ...newImages].filter(Boolean);
        const seen = new Set();
        const finalImages = merged.filter((u) => {
            const key = String(u);
            if (!key || seen.has(key)) return false;
            seen.add(key);
            return true;
        });

        const updatePayload = { ...value };
        if (keepImagesRaw != null || newImages.length > 0) {
            updatePayload.images = finalImages;
            updatePayload.imageUrl = finalImages[0] || "";
        }

        const updateProduct = await Product.findOneAndUpdate(
            { _id: id, storeId: store._id },
            { $set: updatePayload },
            { new: true }
        );

        res.status(200).json({
            message: "Product updated successfully.",
            product: updateProduct
        });

    } catch (error) {
        console.error("Error updating product:", error);
        res.status(500).json({ message: "Internal server error." });
    }
}

exports.updateProductStatusByStore = async (req, res) => {
    try {
        const accountId = req.user?.id;
        if (!accountId) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const store = await Store.findOne({ ownerId: accountId });
        if (!store) {
            return res.status(404).json({ message: "Store not found." });
        }

        const { id } = req.params;
        const { status } = req.body;

        const updateStatus = await Product.findOneAndUpdate(
            { _id: id, storeId: store._id },
            { $set: { status: status } },
            { new: true }
        );

        if (!updateStatus) {
            return res.status(404).json({ message: "Product not found or you do not have permission to update this product." });
        }

        res.status(200).json({
            message: "Product status updated successfully.",
            product: updateStatus
        });
    } catch (error) {
        console.error("Error updating product status:", error);
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

exports.getStoreById = async (req, res) => {
    try {
        const { id } = req.params;
        if (!require('mongoose').Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'ID không hợp lệ' });
        }
        const store = await Store.findById(id);
        if (!store) {
            return res.status(404).json({ message: "Store not found." });
        }
        res.status(200).json({
            message: "Store retrieved successfully.",
            store
        });
    } catch (error) {
        console.error("Error getting store by id:", error);
        res.status(500).json({ message: "Internal server error." });
    }
};

exports.getProductsByStoreId = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'ID không hợp lệ' });
        }
        const store = await Store.findById(id);
        if (!store) {
            return res.status(404).json({ message: "Store not found." });
        }
        const products = await Product.find({ storeId: store._id, status: true });
        res.status(200).json({
            message: "Products retrieved successfully.",
            products
        });
    } catch (error) {
        console.error("Error getting products by store id:", error);
        res.status(500).json({ message: "Internal server error." });
    }
};

exports.getAllStores = async (req, res) => {
    try {
        const accountId = req.user?._id || req.user?.id;
        if (!accountId) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const roleName = req.user?.role;
        if (roleName !== 'admin') {
            return res.status(403).json({ message: "Forbidden: Admin only" });
        }

        const stores = await Store.find();

        res.status(200).json({
            message: "Stores retrieved successfully.",
            stores
        });
    } catch (error) {
        console.error("Error getting all stores:", error);
        res.status(500).json({ message: "Internal server error." });
    }
}

exports.updateStatusStore = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'ID không hợp lệ' });
        }
        const accountId = req.user?._id || req.user?.id;
        if (!accountId) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const roleName = req.user?.role;
        if (roleName !== 'admin') {
            return res.status(403).json({ message: "Forbidden: Admin only" });
        }
        const { status } = req.body;
        const store = await Store.findByIdAndUpdate(
            id,
            { $set: { status: status } },
            { new: true }
        );
        if (!store) {
            return res.status(404).json({ message: "Store not found." });
        }
        res.status(200).json({
            message: "Store status updated successfully.",
            store
        });
    } catch (error) {
        console.error("Error updating store status:", error);
        res.status(500).json({ message: "Internal server error." });
    }
}

exports.getAllOrdersByStore = async (req, res) => {
    try {
        const accountId = req.user?.id;
        if (!accountId) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const store = await Store.findOne({ ownerId: accountId });
        if (!store) {
            return res.status(404).json({ message: "Store not found." });
        }
        const orders = await Order.find({ store: store._id }).sort({ createdAt: -1 });
        res.status(200).json({
            message: "Orders retrieved successfully.",
            orders
        });

    } catch (error) {
        console.error("Error getting orders by store:", error);
        res.status(500).json({ message: "Internal server error." });
    }
}

exports.getOrdersById = async (req, res) => {
    try {
        const accountId = req.user?.id;
        if (!accountId) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const store = await Store.findOne({ ownerId: accountId });
        if (!store) {
            return res.status(404).json({ message: "Store not found." });
        }
        const { orderId } = req.params;
        const order = await Order.findOne({ _id: orderId, store: store._id })
            .populate('paymentMethod')
            .populate('customer')
            .populate({ path: 'orderItems', populate: { path: 'products.productId' } })
            .lean();
        ;
        if (!order) {
            return res.status(404).json({ message: "Order not found." });
        }
        res.status(200).json({
            message: "Order retrieved successfully.",
            order
        });
    } catch (error) {
        console.error("Error getting order by id:", error);
        res.status(500).json({ message: "Internal server error." });
    }
}

exports.updateOrderStatus = async (req, res) => {
    try {
        const accountId = req.user?.id;
        if (!accountId) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const store = await Store.findOne({ ownerId: accountId });
        if (!store) {
            return res.status(404).json({ message: "Store not found." });
        }
        const { orderId } = req.params;
        const { status } = req.body;

        const order = await Order.findOneAndUpdate(
            { _id: orderId, store: store._id },
            { $set: { status: status } },
            { new: true }
        );

        if (!order) {
            return res.status(404).json({ message: "Order not found." });
        }

        res.status(200).json({
            message: "Order status updated successfully.",
            order
        });
    } catch (error) {
        console.error("Error updating order status:", error);
        res.status(500).json({ message: "Internal server error." });
    }
}

