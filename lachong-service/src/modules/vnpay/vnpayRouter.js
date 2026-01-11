const express = require('express');
const router = express.Router();
const vnpayService = require('./vnpayService');

router.post('/vnpay/create-payment', vnpayService.createPayment);

module.exports = router;
