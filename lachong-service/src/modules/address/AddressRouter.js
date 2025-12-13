const express = require('express');
const router = express.Router();
const AddressService = require('../address/AddressService');
const verifyCustomerToken = require('../../services/middleware');

router.post('/address', verifyCustomerToken, AddressService.addAddress);
router.get('/addresses', verifyCustomerToken, AddressService.getAddresses);
router.put('/address/:addressId', verifyCustomerToken, AddressService.updateAddress);
router.put('/address/:addressId/default', verifyCustomerToken, AddressService.setDefaultAddress);
router.delete('/address/:addressId', verifyCustomerToken, AddressService.deleteAddress);

module.exports = router;