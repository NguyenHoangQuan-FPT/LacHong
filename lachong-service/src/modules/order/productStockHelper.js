const mongoose = require('mongoose');
const Product = require('../../models/model/Product');

/**
 * Trừ stock sản phẩm
 * @param {Array<{productId: string, quantity: number}>} products 
 * @throws {Error} Nếu sản phẩm không đủ tồn kho
 */
async function deductProductStock(products) {
    for (const item of products) {
        const product = await Product.findById(item.productId);
        if (!product) throw new Error(`Product not found: ${item.productId}`);
        if (product.stock < item.quantity) {
            throw new Error(`Product ${product.productName} is out of stock (${product.stock} < ${item.quantity})`);
        }
        product.stock -= item.quantity;
        product.sold = (product.sold || 0) + item.quantity;
        await product.save();
    }
}

module.exports = { deductProductStock };
