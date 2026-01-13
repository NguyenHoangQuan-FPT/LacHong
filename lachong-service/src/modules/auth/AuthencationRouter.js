const express = require('express');
const router = express.Router();
const AuthenticationService = require('./AuthenticationService');


router.post('/login', AuthenticationService.login);
router.post('/register', AuthenticationService.registerUser);
router.post('/register-store', AuthenticationService.registerStore);
router.post('/logout', AuthenticationService.logout);
router.post('/activate-account/:token', AuthenticationService.activeAccount);

module.exports = router;