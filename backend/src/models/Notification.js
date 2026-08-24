const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true
    },
    message: {
      type: String,
      required: [true, 'Message is required']
    },
    targetAudience: {
      type: String,
      enum: ['all', 'volunteer', 'elder'],
      default: 'all'
    },
    status: {
      type: String,
      enum: ['draft', 'sent'],
      default: 'draft'
    },
    type: {
      type: String,
      enum: ['system', 'match', 'booking', 'message', 'payment'],
      default: 'system'
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    publishedAt: {
      type: Date,
      default: null
    },
    // Tracks which users have read this notification
    readBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    ],
    // Tracks which users have hidden/dismissed this notification (soft delete for clients)
    hiddenBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    ]
  },
  {
    timestamps: true
  }
);

// Index for efficient client-side queries: find sent notifications not hidden by a user
notificationSchema.index({ status: 1, targetAudience: 1 });
notificationSchema.index({ createdBy: 1, status: 1 });

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;
