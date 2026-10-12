const mongoose = require('mongoose');
const dns = require('dns');

// Fallback to Google and Cloudflare DNS to avoid querySrv ECONNREFUSED on Windows / local router DNS
try {
  dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
} catch (err) {
  console.warn('Could not set custom DNS servers:', err.message);
}

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
