const express = require('express');
const { rateLimit } = require('express-rate-limit');
const {
  getConversations,
  getUnreadCount,
  getConversation,
  getMessages,
  sendMessage,
  markConversationRead
} = require('../controllers/conversation.controller');
const { protect, authorize, volunteerApproved } = require('../middleware/auth.middleware');
const { CHAT_ROLES } = require('../services/chat-access.service');

const router = express.Router();

// Keyed by account rather than IP: elders in one care home can share a network.
const sendMessageRateLimit = rateLimit({
  windowMs: 60 * 1000,
  limit: 30,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  validate: { xForwardedForHeader: false },
  keyGenerator: (req) => String(req.user._id),
  message: { success: false, message: 'You are sending messages too quickly. Please wait a moment.' }
});

// Chat is private between an elder and their volunteer: admins are excluded,
// and per-conversation membership is checked again in every controller.
router.use(protect, volunteerApproved, authorize(...CHAT_ROLES));

router.get('/', getConversations);
router.get('/unread-count', getUnreadCount);
router.get('/:id', getConversation);
router.route('/:id/messages')
  .get(getMessages)
  .post(sendMessageRateLimit, sendMessage);
router.put('/:id/read', markConversationRead);

module.exports = router;
