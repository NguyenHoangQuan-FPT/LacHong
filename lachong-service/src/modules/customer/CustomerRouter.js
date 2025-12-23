const express = require('express');
const router = express.Router();
const CustomerService = require('../customer/CustomerService');
const verifyCustomerToken = require('../../services/middleware');
const upload = require('../../config/multer');

router.get('/customer', verifyCustomerToken, CustomerService.getProfileCustomer);
router.put('/customer', verifyCustomerToken, upload.single('avatar'), CustomerService.updateProfileCustomer);
router.get('/customers', verifyCustomerToken, CustomerService.getAllCustomers);
router.get('/customer/:id', verifyCustomerToken, CustomerService.getAllCustomerById);
router.put('/customer/:id', verifyCustomerToken, CustomerService.updateStatusCustomer);

module.exports = router;