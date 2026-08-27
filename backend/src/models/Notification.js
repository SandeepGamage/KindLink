const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Notification title is required'],
    trim: true
  },
  message: {
    type: String,
    required: [true, 'Notification message is required'],
    trim: true
  },
  type: {
    type: String,
    enum: ['INFO', 'SYSTEM', 'WELCOME', 'ALERT'],
    default: 'INFO'
  },
  audience: {
    type: String,
    enum: ['all', 'volunteer', 'elder'],
    default: 'all'
  },
  sender: {
    type: String,
    default: 'Admin'
  },
  status: {
    type: String,
    enum: ['sent', 'draft'],
    default: 'sent'
  }
}, {
  timestamps: true // This will automatically add createdAt and updatedAt fields
});

module.exports = mongoose.model('Notification', notificationSchema);
