const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, default: 1 },
    priceAtTime: { type: Number, required: true },
    discountPercentAtTime: { type: Number, default: 0 },
    totalPrice: { type: Number },
    storeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Store', required: true },
}, {
    timestamps: true
});

const Cart = mongoose.model('Cart', cartSchema);

module.exports = Cart;