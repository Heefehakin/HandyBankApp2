const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        unique: true,
        trim: true,
        lowercase: true
    },
    phoneNumber: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        minlength: 6
    },
    isBlocked: {
        type: Boolean,
        default: false
    },
    accountNumber: { 
        type: String, 
        unique: true
    }},

    {
        timestamps: true,
        versionKey: false
    });



    // Generate account number before saving
UserSchema.pre('save', async function(next) {
    if (!this.accountNumber) {
        // Generate 10-digit account number
        this.accountNumber = Math.floor(Math.random() * 9000000000) + 1000000000;
    }
    next();
});

const User = mongoose.model('User', UserSchema);
module.exports = User;