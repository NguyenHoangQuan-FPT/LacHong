const PaymentMethod = require('../../models/model/PaymentMethod');

exports.getAllPaymentMethods = async (req, res) => {
    try {
        const paymentMethods = await PaymentMethod.find().lean();
        return res.status(200).json({ paymentMethods });
    } catch (error) {
        return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
}