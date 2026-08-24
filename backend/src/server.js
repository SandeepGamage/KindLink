const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/database');
const authRoutes = require('./routes/auth.routes');
const notificationRoutes = require('./routes/notification.routes');

// 1. Load environment variables
dotenv.config();

// 2. Create Express application
const app = express();

// 3. Enable CORS
app.use(cors());

// 4. Enable JSON request parsing
app.use(express.json());

// 5. Connect to MongoDB
connectDB();

// 6. Register API routes
app.use('/api/auth', authRoutes);
app.use('/api/notifications', notificationRoutes);

// 7. Health-check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'KindLink API is running'
  });
});

// 404 Handler for undefined routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// 8. Define PORT and start server
const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`KindLink Server running on port ${PORT}`);
});

// 9. Handle unhandled promise rejections / startup errors cleanly
process.on('unhandledRejection', (err) => {
  console.error(`Unhandled Error: ${err.message}`);
  // Keep server running or close gracefully depending on environment
});

module.exports = app;
