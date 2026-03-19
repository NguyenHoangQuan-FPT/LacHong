const Order = require('../../models/model/Order');
const { getPayOSClient } = require('./payosClient');

function isSuccessfulPayOSWebhook(body, data) {
    const topCode = body?.code;
    const topSuccess = body?.success;
    const dataCode = data?.code;
    const successByCode = (String(dataCode || topCode || '')).trim() === '00';
    return Boolean(topSuccess) || successByCode;
}

exports.webhook = async (req, res) => {
    try {
        const payos = getPayOSClient();
        const body = req.body;
        const data = await payos.webhooks.verify(body);

        if (!data?.orderCode) {
            return res.status(400).json({ message: 'Missing orderCode' });
        }

        const isPaid = isSuccessfulPayOSWebhook(body, data);

        if (isPaid) {
            await Order.updateMany(
                { payosOrderCode: data.orderCode },
                {
                    $set: {
                        paymentStatus: 'Paid',
                        paymentProvider: 'PAYOS',
                        status: 'Processing',
                        payosPaymentLinkId: data.paymentLinkId,
                    },
                }
            );
        } else {
            await Order.updateMany(
                { payosOrderCode: data.orderCode, paymentStatus: { $ne: 'Paid' } },
                {
                    $set: {
                        paymentStatus: 'Failed',
                        paymentProvider: 'PAYOS',
                        payosPaymentLinkId: data.paymentLinkId,
                    },
                }
            );
        }

        return res.status(200).json({ message: 'OK' });
    } catch (error) {
        console.error('payos webhook error:', error);
        return res.status(400).json({ message: 'Webhook verify failed' });
    }
};
