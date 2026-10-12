const mongoose = require('mongoose');

/**
 * One chat thread per elder–volunteer pair.
 *
 * A conversation is only ever created from an approved connection (an
 * appointment the volunteer has accepted — see services/chat-access.service.js),
 * so its existence proves the pair was matched at some point. Whether the pair
 * may still *send* messages is decided live from their appointments, never
 * stored here, so a cancelled or completed connection locks the chat at once.
 */
const conversationSchema = new mongoose.Schema(
  {
    elder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    volunteer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    // The most recent approved appointment linking the pair.
    connection: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appointment',
      required: true
    },
    lastMessageAt: {
      type: Date,
      default: null
    },
    lastMessageSnippet: {
      type: String,
      default: ''
    },
    lastMessageSender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    }
  },
  {
    timestamps: true
  }
);

conversationSchema.index({ elder: 1, volunteer: 1 }, { unique: true });
conversationSchema.index({ volunteer: 1, lastMessageAt: -1 });
conversationSchema.index({ elder: 1, lastMessageAt: -1 });

module.exports = mongoose.model('Conversation', conversationSchema);
