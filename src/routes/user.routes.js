const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getAccountNumber } = require('../controllers/user.controller.js');

router.post('/register', registerUser)
router.post('/login', loginUser)
router.get('/account', getAccountNumber)


module.exports = router;