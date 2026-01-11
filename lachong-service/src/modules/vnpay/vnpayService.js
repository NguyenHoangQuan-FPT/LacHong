const moment = require('moment');
const crypto = require('crypto');
require('dotenv').config();

exports.createPayment = (req, res) => {
    try {
        const ipAddr = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
        const tmnCode = process.env.VNP_TMNCODE;
        const secretKey = process.env.VNP_HASHSECRET;
        const vnpUrl = process.env.VNP_URL;
        const returnUrl = process.env.VNP_RETURN_URL;

        let { amount, orderInfo, orderType, bankCode } = req.body;
        amount = amount * 100;
        const date = new Date();
        const createDate = moment(date).format('YYYYMMDDHHmmss');
        const orderId = moment(date).format('HHmmss');

        let vnp_Params = {};
        vnp_Params['vnp_Version'] = '2.1.0';
        vnp_Params['vnp_Command'] = 'pay';
        vnp_Params['vnp_TmnCode'] = tmnCode;
        vnp_Params['vnp_Locale'] = 'vn';
        vnp_Params['vnp_CurrCode'] = 'VND';
        vnp_Params['vnp_TxnRef'] = orderId;
        vnp_Params['vnp_OrderInfo'] = orderInfo || 'Thanh toan don hang';
        vnp_Params['vnp_OrderType'] = orderType || 'other';
        vnp_Params['vnp_Amount'] = amount;
        vnp_Params['vnp_ReturnUrl'] = returnUrl;
        vnp_Params['vnp_IpAddr'] = ipAddr;
        vnp_Params['vnp_CreateDate'] = createDate;
        if (bankCode) {
            vnp_Params['vnp_BankCode'] = bankCode;
        }

        // Bước 1: Sort params
        vnp_Params = sortObject(vnp_Params);

        // Bước 2: Tạo chuỗi query
        const signData = Object.keys(vnp_Params).map(key => `${key}=${vnp_Params[key]}`).join('&');
        const hmac = crypto.createHmac('sha512', secretKey);
        const signed = hmac.update(new Buffer.from(signData, 'utf-8')).digest('hex');
        vnp_Params['vnp_SecureHash'] = signed;

        const querystring = require('qs');
        const paymentUrl = vnpUrl + '?' + querystring.stringify(vnp_Params, { encode: false });
        return res.json({ paymentUrl });
    } catch (error) {
        return res.status(500).json({ message: 'Lỗi tạo thanh toán VNPay', error: error.message });
    }
}

function sortObject(obj) {
    const sorted = {};
    const keys = Object.keys(obj).sort();
    for (let key of keys) {
        sorted[key] = obj[key];
    }
    return sorted;
}