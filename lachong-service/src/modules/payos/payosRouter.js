const express = require('express');
const router = express.Router();
const payosService = require('./payosService');

router.post('/payos/webhook', payosService.webhook);

module.exports = router;
