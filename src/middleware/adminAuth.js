const jwt = require('jsonwebtoken');
const Admin = require('../models/admin.model.js');

const adminAuth = async (req, res, next) => {
    try {
        // Get token from header
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({
                status: 'error',
                message: 'No token provided'
            });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Check if adminId exists in decoded token
        if (!decoded.adminId) {
            throw new Error('Invalid token structure');
        }

        // Find admin
        const admin = await Admin.findById(decoded.adminId);
        
        if (!admin || admin.role !== 'admin') {
            throw new Error('Not authorized');
        }

        // Attach admin to request
        req.admin = admin;
        req.token = token;
        next();
    } catch (error) {
        console.error('Auth Error:', error.message);
        res.status(401).json({
            status: 'error',
            message: 'Not authorized as admin'
        });
    }
};

module.exports = adminAuth;