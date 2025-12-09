const express = require('express');
const router = express.Router();
const MaterialService = require('../material/MaterialService');

router.get('/materials', MaterialService.getAllMaterials);

module.exports = router;