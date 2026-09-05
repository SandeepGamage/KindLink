// Loaded before anything else is required: modules that read process.env when
// they are first imported would otherwise see an empty environment.
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');
const { UPLOAD_ROOT, initStorage } = require('./config/storage');
const authRoutes = require('./routes/auth.routes');
const appointmentRoutes = require('./routes/appointment.routes');

const reviewRoutes = require('./routes/review.routes');
const notificationRoutes = require('./routes/notification.routes');
const adminRoutes = require('./routes/admin.routes');
const uploadRoutes = require('./routes/upload.routes');

// 1. Resolve the avatar storage driver and report which one is active
initStorage();

// 2. Create Express application
const app = express();

// 3. Enable CORS
app.use(cors());

// 4. Enable JSON & URL-encoded request parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 5. Connect to MongoDB
connectDB();

// 5b. Serve uploaded files (avatars) — clients store the relative path
//     "/uploads/avatars/<file>" and resolve it against their own API origin.
app.use('/uploads', express.static(UPLOAD_ROOT));

// 6. Register API routes
app.use('/api/auth', authRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/ratings', reviewRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/uploads', uploadRoutes);

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
const PORT = process.env.PORT;

const server = app.listen(PORT, () => {
  console.log(`KindLink Server running on port ${PORT}`);
});

// 9. Handle unhandled promise rejections / startup errors cleanly
process.on('unhandledRejection', (err) => {
  console.error(`Unhandled Error: ${err.message}`);
  // Keep server running or close gracefully depending on environment
});

module.exports = app;
