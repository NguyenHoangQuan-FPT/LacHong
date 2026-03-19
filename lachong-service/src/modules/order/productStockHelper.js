const mongoose = require('mongoose');
const Product = require('../../models/model/Product');

function normalizeProducts(products) {
    const aggregated = new Map();
    for (const item of products || []) {
        if (!item?.productId) continue;
        const productId = String(item.productId);
        const quantity = Number(item.quantity || 0);
        if (!mongoose.isValidObjectId(productId) || quantity <= 0) continue;
        aggregated.set(productId, (aggregated.get(productId) || 0) + quantity);
    }
    return Array.from(aggregated.entries()).map(([productId, quantity]) => ({ productId, quantity }));
}

function buildOutOfStockError(payload) {
    const err = new Error(payload?.message || 'Out of stock');
    err.name = 'OutOfStockError';
    err.code = 'OUT_OF_STOCK';
    err.status = 409;
    err.details = payload?.details;
    return err;
}

/**
 * Hoàn trả stock (best-effort) cho các sản phẩm đã trừ.
 * @param {Array<{productId: string, quantity: number}>} products
 */
async function restoreProductStock(products) {
    const normalized = normalizeProducts(products);
    for (const item of normalized) {
        await Product.updateOne(
            { _id: item.productId },
            { $inc: { stock: item.quantity } }
        );
        // sold rollback best-effort; tránh âm.
        await Product.updateOne(
            { _id: item.productId, sold: { $gte: item.quantity } },
            { $inc: { sold: -item.quantity } }
        );
    }
}

/**
 * Trừ stock sản phẩm
 * @param {Array<{productId: string, quantity: number}>} products 
 * @throws {Error} Nếu sản phẩm không đủ tồn kho
 */
async function deductProductStock(products) {
    const normalized = normalizeProducts(products);
    const deductedSoFar = [];

    for (const item of normalized) {
        const updated = await Product.findOneAndUpdate(
            { _id: item.productId, stock: { $gte: item.quantity } },
            { $inc: { stock: -item.quantity, sold: item.quantity } },
            { new: true }
        ).lean();

        if (!updated) {
            // rollback những món đã trừ trước đó
            if (deductedSoFar.length > 0) {
                await restoreProductStock(deductedSoFar);
            }

            const product = await Product.findById(item.productId).lean();
            if (!product) {
                throw buildOutOfStockError({
                    message: `Product not found: ${item.productId}`,
                    details: [{ productId: item.productId, reason: 'NOT_FOUND' }]
                });
            }

            throw buildOutOfStockError({
                message: `Product ${product.productName} is out of stock (${product.stock} < ${item.quantity})`,
                details: [{
                    productId: String(product._id),
                    productName: product.productName,
                    stock: product.stock,
                    requested: item.quantity
                }]
            });
        }

        deductedSoFar.push(item);
    }
}

module.exports = { deductProductStock, restoreProductStock };
