const express = require('express');
const typeStoreService = require('./typeStoreService');
const router = express.Router();
const verifyToken = require('../../services/middleware');

router.get('/typeStores', verifyToken, typeStoreService.getAllTypeStores);
router.get('/typeStoreTrue', typeStoreService.getTypeStoreTrue);
router.post('/typeStore', verifyToken, typeStoreService.createTypeStore);
router.put('/typeStore/:id', verifyToken, typeStoreService.updateTypeStore);

module.exports = router;