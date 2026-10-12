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
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  sender: {
    type: String,
    default: 'Admin'
  },
  status: {
    type: String,
    enum: ['sent', 'draft'],
    default: 'sent'
  },
  // 'admin' = a broadcast written by an admin; 'system' = an automatic message
  // such as an appointment update. Only createNotification sets 'admin', so
  // anything else defaults to 'system' and stays out of the admin screens.
  source: {
    type: String,
    enum: ['admin', 'system'],
    default: 'system'
  }
}, {
  timestamps: true // This will automatically add createdAt and updatedAt fields
});

/**
 * Query filter for admin broadcasts. Notifications created before `source`
 * existed have no such key stored, so legacy broadcasts are recognised by
 * their shape: no recipient, and sender 'Admin' or none at all (the earliest
 * broadcasts predate the sender field). Automatic messages always carry the
 * acting user's name as sender, so they never match.
 */
notificationSchema.statics.BROADCAST_FILTER = {
  $or: [
    { source: 'admin' },
    { source: { $exists: false }, recipient: null, sender: { $in: ['Admin', null] } }
  ]
};

/**
 * The real source of a plain (lean) notification object. Hydrated documents
 * can't be trusted here: Mongoose fills a missing `source` with the schema
 * default 'system', which would mislabel legacy admin broadcasts. Mirrors the
 * legacy rule in BROADCAST_FILTER.
 */
notificationSchema.statics.resolveSource = function (doc) {
  if (doc.source) return doc.source;
  const isLegacyBroadcast = doc.recipient == null && (doc.sender == null || doc.sender === 'Admin');
  return isLegacyBroadcast ? 'admin' : 'system';
};

module.exports = mongoose.model('Notification', notificationSchema);
