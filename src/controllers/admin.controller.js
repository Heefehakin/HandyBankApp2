const Admin = require('../models/admin.model.js');
const User = require('../models/user.model.js');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { passwordHash, passwordCompare } = require('../middleware/hashing.js');

//Admin Signup
const adminSignup = async (req, res) => {
    const { firstName, lastName, email, password, phoneNumber, role, isActive } = req.body;
    try {
        if (!firstName || !lastName || !email || !password || !phoneNumber || !role) {
            return res.status(400).json({ message: "Please fill all required fields" });
        }
        
        const admin = await Admin.findOne({ email });
        if (admin) {
            return res.status(400).json({ message: "Email Already Exists" });
        }
        
        const hashedPassword = await passwordHash(password);
        
        const newAdmin = await Admin.create({
            firstName,
            lastName,
            email,
            password: hashedPassword,
            phoneNumber,
            role,
            isActive: isActive || true
        });
        
        return res.status(201).json({ 
            message: "Admin Created Successfully", 
            admin: newAdmin 
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'An error occurred while creating the admin' });
    }
};

// Admin Login
const adminLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate required fields
        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }

        // Find admin by email
        const admin = await Admin.findOne({ email });
        if (!admin) {
            return res.status(404).json({ message: "Admin not found" });
        }

        // Check if admin is active
        if (!admin.isActive) {
            return res.status(403).json({ message: "Account is deactivated" });
        }

        // Verify password
        const isValidPassword = await passwordCompare(password, admin.password);
        if (!isValidPassword) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        // Generate JWT token
        const token = jwt.sign(
            { 
                adminId: admin._id, 
                email: admin.email,
                role: admin.role 
            },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        return res.status(200).json({
            message: "Login successful",
            token,
            admin: {
                firstName: admin.firstName,
                lastName: admin.lastName,
                email: admin.email,
                role: admin.role
            }
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Error during login" });
    }
};

// Get all users
const getAllUsers = async (req, res) => {
    try {
        const users = await User.find({}, '-password');
        const totalUsers = await User.countDocuments();
        
        return res.status(200).json({
            message: "Users retrieved successfully",
            totalUsers,
            users
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error retrieving users' });
    }
};



// Block/Unblock user
const toggleUserBlock = async (req, res) => {
    try {
        const { id } = req.params;  // Changed from userId to id to match route parameter
        const { isBlocked } = req.body;

        const user = await User.findByIdAndUpdate(
            id,
            { isBlocked },
            { new: true }
        );

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const action = isBlocked ? "blocked" : "unblocked";
        return res.status(200).json({
            message: `User ${action} successfully`,
            user
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error updating user block status' });
    }
};

module.exports = {
    adminSignup,
    adminLogin,
    getAllUsers,
    toggleUserBlock
};