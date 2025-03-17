const User = require('../models/user.model.js');
const { passwordHash, passwordCompare } = require('../middleware/hashing.js');
const jwt = require('jsonwebtoken');

// User Registration
const registerUser = async (req, res) => {
    try {
        const { firstName, lastName, email, phoneNumber, password } = req.body;

        // Validate required fields
        if (!firstName || !lastName || !email || !phoneNumber || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ 
            $or: [{ email }, { phoneNumber }] 
        });
        if (existingUser) {
            return res.status(400).json({ 
                message: "User already exists with this email or phone number" 
            });
        }

        // Hash password
        const hashedPassword = await passwordHash(password);
        
        // Create new user
        const newUser = await User.create({
            firstName,
            lastName,
            email,
            phoneNumber,
            password: hashedPassword
        });

        return res.status(201).json({
            message: "User registered successfully",
            user: {
                firstName: newUser.firstName,
                lastName: newUser.lastName,
                email: newUser.email,
                phoneNumber: newUser.phoneNumber,
                accountNumber: newUser.accountNumber
            }
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Error creating user account" });
    }
};

// User Login
const loginUser = async (req, res) => {
    try {
        const { phoneNumber, password } = req.body;

        // Validate required fields
        if (!phoneNumber || !password) {
            return res.status(400).json({ message: "Phone number and password are required" });
        }

        // Find user by phone number
        const user = await User.findOne({ phoneNumber });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Check if user is blocked
        if (user.isBlocked) {
            return res.status(403).json({ message: "Account is blocked. Please contact admin." });
        }

        // Verify password
        const isValidPassword = await passwordCompare(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        // Generate JWT token
        const token = jwt.sign(
            { userId: user._id, phoneNumber: user.phoneNumber },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        return res.status(200).json({
            message: "Login successful",
            token,
            user: {
                firstName: user.firstName,
                lastName: user.lastName,
                accountNumber: user.accountNumber
            }
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Error during login" });
    }
};

// Get Account Number
const getAccountNumber = async (req, res) => {
    try {
        const { phoneNumber } = req.query;

        if (!phoneNumber) {
            return res.status(400).json({ message: "Phone number is required" });
        }

        const user = await User.findOne({ phoneNumber }, 'accountNumber');
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        return res.status(200).json({
            message: "Account number retrieved successfully",
            accountNumber: user.accountNumber
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Error retrieving account number" });
    }
};

module.exports = {
    registerUser,
    loginUser,
    getAccountNumber
};