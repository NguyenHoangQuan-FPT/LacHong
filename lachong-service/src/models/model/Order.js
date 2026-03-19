const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    code: { type: String },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
    store: { type: mongoose.Schema.Types.ObjectId, ref: 'Store', required: true },
    orderItems: [{ type: mongoose.Schema.Types.ObjectId, ref: 'OrderItem', required: true }],
    totalAmount: { type: Number, required: true },
    paymentMethod: { type: mongoose.Schema.Types.ObjectId, ref: 'PaymentMethod', required: true },
    paymentStatus: { type: String, enum: ['Unpaid', 'Paid', 'Failed'], default: 'Unpaid' },
    paymentProvider: { type: String, enum: ['COD', 'PAYOS'], default: 'COD' },
    payosOrderCode: { type: Number },
    payosPaymentLinkId: { type: String },
    address: { type: String, required: true },
    status: { type: String, enum: ['Pending', 'Processing', 'Completed', 'Cancelled'], default: 'Pending' }
}, {
    timestamps: true
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;