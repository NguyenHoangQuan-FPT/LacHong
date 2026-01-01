const mongoose = require('mongoose');
const { min } = require('../DTOs/StoreDTO');

const productSchema = new mongoose.Schema({
    productName: { type: String, required: true, unique: true },
    description: { type: String },
    policy: { type: String },
    price: { type: Number, required: true },
    stock: { type: Number, required: true },
    imageUrl: { type: String },
    images: [{ type: String }],
    discountPercent: { type: Number, default: 0 },
    reviews: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Review' }],
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    material: { type: mongoose.Schema.Types.ObjectId, ref: 'Material', required: true },
    storeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Store', required: true },
    sold: { type: Number, default: 0, min: 0 },
    status: { type: Boolean, default: true }
}, {
    timestamps: true
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;