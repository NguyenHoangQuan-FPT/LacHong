const mongoose = require('mongoose');

const wishListSchema = new mongoose.Schema({
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
    products: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }]
}, {
    timestamps: true
});

const WishList = mongoose.model('WishList', wishListSchema);

module.exports = WishList;