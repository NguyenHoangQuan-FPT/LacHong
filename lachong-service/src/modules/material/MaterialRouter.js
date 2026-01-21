const express = require('express');
const router = express.Router();
const MaterialService = require('../material/MaterialService');
const verifyToken = require('../../services/middleware');

router.get('/materials', MaterialService.getAllMaterials);
router.get('/materials/admin', verifyToken, MaterialService.getMaterials);
router.post('/materials', verifyToken, MaterialService.createMaterial);
router.put('/materials/admin/:id', verifyToken, MaterialService.updateMaterial);

module.exports = router;