const mongoose = require('mongoose');

/**
 * Connect to MongoDB Atlas / Database
 * 
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    // Optional: process.exit(1) or let application handle startup gracefully
  }
};

module.exports = connectDB;
