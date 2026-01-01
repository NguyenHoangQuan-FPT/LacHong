const Cart = require('../../models/model/Cart');
const Customer = require('../../models/model/Customer');
const Account = require('../../models/model/Account');
const Product = require('../../models/model/Product');

exports.getCartItems = async (req, res) => {
    try {
        const accountId = req.user?.id;
        if (!accountId) {
            return res.status(401).json({ message: "Unauthorized." });
        }

        const customer = await Customer.findOne({ accountId });
        if (!customer) {
            return res.status(404).json({ message: "Customer not found." });
        }

        const cartItems = await Cart.find({ customerId: customer._id }).populate('productId', 'productName imageUrl').exec();
        return res.status(200).json({ cartItems });
    } catch (error) {
        console.error("Error fetching cart items:", error);
        res.status(500).json({ message: "Internal server error." });
    }
}

exports.addToCart = async (req, res) => {
    try {
        const accountId = req.user?.id;
        const { productId, quantity } = req.body;
        if (!accountId) {
            return res.status(401).json({ message: "Unauthorized." });
        }

        const customer = await Customer.findOne({ accountId });
        if (!customer) {
            return res.status(404).json({ message: "Customer not found." });
        }

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: "Product not found." });
        }

        if (!productId) {
            return res.status(400).json({ message: "Product ID not found." });
        }
        const qlt = quantity ? Number(quantity) : 1;

        const existingCartItem = await Cart.findOne({
            customerId: customer._id,
            productId: productId,
        });
        if (existingCartItem) {
            existingCartItem.quantity += qlt;
            existingCartItem.priceAtTime = product.price;
            existingCartItem.discountPercentAtTime = product.discountPercent || 0;
            existingCartItem.totalPrice = product.price * existingCartItem.quantity;
            await existingCartItem.save();
            return res.status(200).json({
                message: "Product quantity updated in cart successfully.",
                cart: existingCartItem
            });
        }

        const newCartItem = new Cart({
            customerId: customer._id,
            productId: productId,
            quantity: qlt,
            priceAtTime: product.price,
            discountPercentAtTime: product.discountPercent || 0,
            totalPrice: product.price * qlt,
            storeId: product.storeId
        });

        await newCartItem.save();
        return res.status(201).json({
            message: "Product added to cart successfully.",
            cart: newCartItem
        });

    } catch (error) {
        console.error("Error adding to cart:", error);
        res.status(500).json({ message: "Internal server error." });
    }
}

exports.updateQuantity = async (req, res) => {
    try {
        const accountId = req.user?.id;
        const { cartId, quantity } = req.body;
        if (!accountId) {
            return res.status(401).json({ message: "Unauthorized." });
        }

        const customer = await Customer.findOne({ accountId });
        if (!customer) {
            return res.status(404).json({ message: "Customer not found." });
        }

        const cartItem = await Cart.findOne({ _id: cartId, customerId: customer._id });
        if (!cartItem) {
            return res.status(404).json({ message: "Cart item not found." });
        }

        const product = await Product.findById(cartItem.productId);
        if (!product) {
            return res.status(404).json({ message: "Product not found." });
        }

        if (quantity > product.stock) {
            return res.status(400).json({ message: `Sản phẩm không đủ trong kho` });
        }

        cartItem.quantity = quantity;
        cartItem.priceAtTime = product.price;
        cartItem.discountPercentAtTime = product.discountPercent || 0;
        cartItem.totalPrice = product.price * cartItem.quantity;

        await cartItem.save();

        res.status(200).json({
            message: "Cart item quantity updated successfully.",
            cart: cartItem
        });
    } catch (error) {
        console.error("Error updating cart item quantity:", error);
        res.status(500).json({ message: "Internal server error." });
    }
}

exports.removeItem = async (req, res) => {
    try {
        const accountId = req.user?.id;
        const { cartId } = req.body;
        if (!accountId) {
            return res.status(401).json({ message: "Unauthorized." });
        }

        const customer = await Customer.findOne({ accountId });
        if (!customer) {
            return res.status(404).json({ message: "Customer not found." });
        }

        const cartItem = await Cart.findOneAndDelete({ _id: cartId, customerId: customer._id });
        if (!cartItem) {
            return res.status(404).json({ message: "Cart item not found." });
        }

        res.status(200).json({ message: "Cart item removed successfully." });
    } catch (error) {
        console.error("Error removing cart item:", error);
        res.status(500).json({ message: "Internal server error." });
    }
}

exports.removeAllCartItems = async (req, res) => {
    try {
        const accountId = req.user?.id;
        if (!accountId) {
            return res.status(401).json({ message: "Unauthorized." });
        }

        const customer = await Customer.findOne({ accountId });
        if (!customer) {
            return res.status(404).json({ message: "Customer not found." });
        }
        await Cart.deleteMany({ customerId: customer._id });

        res.status(200).json({ message: "All cart items removed successfully." });
    } catch (error) {
        console.error("Error removing all cart items:", error);
        res.status(500).json({ message: "Internal server error." });
    }
}