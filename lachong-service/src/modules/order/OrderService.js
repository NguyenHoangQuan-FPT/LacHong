const Order = require('../../models/model/Order');
const OrderItem = require('../../models/model/OrderItem');
const PaymentMethod = require('../../models/model/PaymentMethod');
const Cart = require('../../models/model/Cart');
const Customer = require('../../models/model/Customer');


exports.createOrder = async (req, res) => {
    try {
        const accountId = req.user?.id;
        if (!accountId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        // Find customer from account
        const customer = await Customer.findOne({ accountId });
        if (!customer) {
            return res.status(404).json({ message: 'Customer not found' });
        }

        const { paymentMethod, cartIds } = req.body;
        if (!paymentMethod) {
            return res.status(400).json({ message: 'paymentMethod is required' });
        }
        if (!cartIds) {
            return res.status(400).json({ message: 'cartIds is required' });
        }

        // Convert cartIds to array if it's a string
        let cartIdArray = Array.isArray(cartIds) ? cartIds : [cartIds];

        if (cartIdArray.length === 0) {
            return res.status(400).json({ message: 'cartIds cannot be empty' });
        }

        console.log('Customer ID:', customer._id);
        console.log('Cart IDs to find:', cartIdArray);

        // Fetch only selected cart items for this customer
        const cartItems = await Cart.find({
            customerId: customer._id,
            _id: { $in: cartIdArray }
        }).lean();

        console.log('Found cart items:', cartItems);

        if (!cartItems || cartItems.length === 0) {
            // Check if cart exists but belongs to different customer
            const anyCart = await Cart.findById(cartIdArray[0]);
            console.log('Cart check (without customer filter):', anyCart);

            return res.status(400).json({
                message: 'No valid cart items found for the provided cartIds',
                debug: {
                    customerId: customer._id,
                    requestedCartIds: cartIdArray,
                    cartExists: !!anyCart,
                    cartOwnerId: anyCart?.customerId
                }
            });
        }

        // Group items by storeId
        const itemsByStore = cartItems.reduce((acc, item) => {
            const key = String(item.storeId);
            if (!acc[key]) acc[key] = [];
            acc[key].push(item);
            return acc;
        }, {});

        const createdOrders = [];
        const usedCartIds = [];

        for (const [storeId, items] of Object.entries(itemsByStore)) {
            let totalAmount = 0;
            const products = items.map(it => {
                totalAmount += (it.priceAtTime || 0) * it.quantity;
                usedCartIds.push(it._id);
                return {
                    productId: it.productId,
                    quantity: it.quantity,
                    price: it.priceAtTime || 0
                };
            });

            const orderDoc = new Order({
                customer: customer._id,
                store: storeId,
                products,
                totalAmount,
                paymentMethod: paymentMethod,
                status: 'Pending'
            });
            const savedOrder = await orderDoc.save();

            // Persist order items
            for (const p of products) {
                const orderItem = new OrderItem({
                    orderId: savedOrder._id,
                    productId: p.productId,
                    quantity: p.quantity,
                    price: p.price
                });
                await orderItem.save();
            }

            createdOrders.push(savedOrder);
        }

        await Cart.deleteMany({ _id: { $in: usedCartIds } });

        return res.status(201).json({
            message: 'Orders created from selected cart items successfully',
            orders: createdOrders,
            orderCount: createdOrders.length
        });
    } catch (error) {
        return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
}

exports.getOrders = async (req, res) => {
    try {
        const accountId = req.user?.id;
        if (!accountId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const customer = await Customer.findOne({ accountId });
        if (!customer) {
            return res.status(404).json({ message: 'Customer not found' });
        }

        const orders = await Order.find({ customer: customer._id })
            .populate('store')
            .populate('paymentMethod')
            .sort({ createdAt: -1 });

        return res.status(200).json({ orders });
    } catch (error) {
        return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
}