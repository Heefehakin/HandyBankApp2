const mongoose = require("mongoose");
require("dotenv").config();

const connectDb = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI)
        console.log("Connected to Database");
    } catch (error) {
        console.error("Error connecting to Databse", error.message);
        process.exit(1);
    }
};

module.exports = connectDb;