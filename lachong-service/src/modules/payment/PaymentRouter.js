const express = require('express');
const router = express.Router();
const PaymentServices = require('../payment/PaymentService');

router.get('/payment-methods', PaymentServices.getAllPaymentMethods);

module.exports = router;