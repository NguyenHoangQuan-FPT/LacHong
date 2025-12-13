const express = require('express');
const router = express.Router();
const CustomerService = require('../customer/CustomerService');
const verifyCustomerToken = require('../../services/middleware');

router.get('/customer', verifyCustomerToken, CustomerService.getProfileCustomer);
router.put('/customer', verifyCustomerToken, CustomerService.updateProfileCustomer);

module.exports = router;