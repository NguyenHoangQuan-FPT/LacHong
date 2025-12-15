const express = require('express');
const router = express.Router();
const CustomerService = require('../customer/CustomerService');
const verifyCustomerToken = require('../../services/middleware');
const upload = require('../../config/multer');

router.get('/customer', verifyCustomerToken, CustomerService.getProfileCustomer);
router.put('/customer', verifyCustomerToken, upload.single('avatar'), CustomerService.updateProfileCustomer);

module.exports = router;