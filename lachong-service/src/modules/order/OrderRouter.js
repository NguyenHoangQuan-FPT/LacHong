const express = require('express');
const OrderService = require('./OrderService');
const verifyCustomerToken = require('../../services/middleware');

const router = express.Router();

router.post('/orders', verifyCustomerToken, OrderService.createOrder);
router.get('/orders', verifyCustomerToken, OrderService.getOrders);


module.exports = router;
