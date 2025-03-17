const express = require('express');
const router = express.Router();
const { adminSignup, getAllUsers, toggleUserBlock, adminLogin } = require('../controllers/admin.controller.js');
const adminAuth = require('../middleware/adminAuth.js');


router.post('/Signup', adminSignup);
router.post('/login', adminLogin)
router.get('/users', adminAuth, getAllUsers)
router.patch('/users/:id/block', adminAuth, toggleUserBlock)


module.exports = router;