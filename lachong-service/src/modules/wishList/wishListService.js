const Customer = require('../../models/model/Customer');
const WishList = require('../../models/model/WishList');
const Product = require('../../models/model/Product');


exports.getWishListByCustomerId = async (req, res) => {
    try {
        const accountId = req.user.id;
        const customer = await Customer.findOne({ accountId: accountId }).exec();

        if (!customer) {
            return res.status(404).json({ message: "Customer not found." });
        }
        const wishLists = await WishList.find({ customer: customer._id })
            .populate('products')
            .exec();

        // Flatten all products from all wishlists (should be one wishlist per customer)
        let products = [];
        if (wishLists.length > 0) {
            products = wishLists.reduce((acc, wl) => {
                if (Array.isArray(wl.products)) {
                    acc.push(...wl.products.filter(Boolean));
                }
                return acc;
            }, []);
        }

        res.status(200).json({
            message: "Wish list retrieved successfully.",
            products
        });
    } catch (error) {
        console.error("Error getting wish list:", error);
        res.status(500).json({ message: "Internal server error." });
    }
}

exports.addProductToWishList = async (req, res) => {
    try {
        const accountId = req.user.id;
        if (!accountId) {
            return res.status(401).json({ message: "Unauthorized." });
        }

        const { productId } = req.body;
        const customer = await Customer.findOne({ accountId: accountId }).exec();

        if (!customer) {
            return res.status(404).json({ message: "Customer not found." });
        }

        const product = await Product.findById(productId).exec();
        if (!product) {
            return res.status(404).json({ message: "Product not found." });
        }
        // Check if wishlist exists for this customer
        let wishList = await WishList.findOne({ customer: customer._id }).exec();
        if (wishList) {
            // Check if product already in wishlist
            if (wishList.products.includes(productId)) {
                return res.status(400).json({ message: "Product already in wish list." });
            }
            wishList.products.push(productId);
            await wishList.save();
        } else {
            wishList = new WishList({ customer: customer._id, products: [productId] });
            await wishList.save();
        }

        // Populate products for response
        await wishList.populate('products');
        return res.status(200).json({ message: "Product added to wish list successfully.", wishList });
    } catch (error) {
        console.error("Error adding product to wish list:", error);
        res.status(500).json({ message: "Internal server error." });
    }
}

exports.removeProductFromWishList = async (req, res) => {
    try {
        const accountId = req.user.id;
        if (!accountId) {
            return res.status(401).json({ message: "Unauthorized." });
        }

        const { productId } = req.params;

        const customer = await Customer.findOne({ accountId: accountId }).exec();
        if (!customer) {
            return res.status(404).json({ message: "Customer not found." });
        }

        // Find the wishlist for this customer
        const wishList = await WishList.findOne({ customer: customer._id }).exec();
        if (!wishList) {
            return res.status(404).json({ message: "Wish list not found." });
        }
        // Remove the product from the products array
        const before = wishList.products.length;
        wishList.products = wishList.products.filter(
            (id) => id.toString() !== productId
        );
        if (wishList.products.length === before) {
            return res.status(404).json({ message: "Product not found in wish list." });
        }
        await wishList.save();
        await wishList.populate('products');
        res.status(200).json({ message: "Product removed from wish list successfully.", wishList });
    } catch (error) {
        console.error("Error removing product from wish list:", error);
    }
}

exports.clearWishList = async (req, res) => {
    try {
        const accountId = req.user.id;
        if (!accountId) {
            return res.status(401).json({ message: "Unauthorized." });
        }

        const customer = await Customer.findOne({ accountId: accountId }).exec();
        if (!customer) {
            return res.status(404).json({ message: "Customer not found." });
        }

        const wishList = await WishList.findOne({ customer: customer._id }).exec();
        if (!wishList) {
            return res.status(404).json({ message: "Wish list not found." });
        }
        wishList.products = [];
        await wishList.save();
        res.status(200).json({ message: "Wish list cleared successfully." });
    } catch (error) {
        console.error("Error clearing wish list:", error);
        res.status(500).json({ message: "Internal server error." });
    }
}