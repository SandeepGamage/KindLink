const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const {
  idString,
  pairKey,
  ownField,
  otherField,
  syncConversationsFor,
  loadConversationFor
} = require('../services/chat-access.service');

const DEFAULT_PAGE_SIZE = 50;
const MAX_PAGE_SIZE = 100;
// Upper bound for one incremental poll, so a long-offline device can't pull an
// unbounded response; it simply catches up over the next polls.
const MAX_SYNC_BATCH = 200;
const SNIPPET_LENGTH = 120;

const CLOSED_CHAT_MESSAGE =
  'This chat is closed because the connection is no longer active. You can still read earlier messages.';

const notFound = (res) =>
  res.status(404).json({ success: false, message: 'Conversation not found' });

const serverError = (res, label, error) => {
  console.error(`${label}:`, error);
  return res.status(500).json({ success: false, message: 'Something went wrong. Please try again.' });
};

const parseDate = (value) => {
  if (!value || typeof value !== 'string') return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const serializeMessage = (m) => ({
  _id: m._id,
  conversation: m.conversation,
  sender: m.sender,
  recipient: m.recipient,
  content: m.content,
  isRead: m.isRead,
  readAt: m.readAt,
  clientId: m.clientId || null,
  createdAt: m.createdAt
});

const serializeConnection = (appt) =>
  appt ? { _id: appt._id, title: appt.title || appt.taskType, status: appt.status } : null;

// @desc    Conversations for every approved connection the caller has
// @route   GET /api/conversations
// @access  Private — elders and approved volunteers
exports.getConversations = async (req, res) => {
  try {
    const me = req.user._id;
    const activePairs = await syncConversationsFor(req.user);

    const conversations = await Conversation.find({ [ownField(req.user)]: me })
      .populate(otherField(req.user), '_id name profileImage role isActive')
      .populate('connection', '_id title taskType status')
      .sort({ lastMessageAt: -1, updatedAt: -1 })
      .lean();

    const unread = await Message.aggregate([
      {
        $match: {
          recipient: me,
          isRead: false,
          conversation: { $in: conversations.map((c) => c._id) }
        }
      },
      { $group: { _id: '$conversation', count: { $sum: 1 } } }
    ]);
    const unreadById = new Map(unread.map((u) => [idString(u._id), u.count]));

    const data = conversations
      // A participant whose account was deleted leaves nothing to show.
      .filter((c) => c[otherField(req.user)])
      .map((c) => {
        const otherUser = c[otherField(req.user)];
        return {
          _id: c._id,
          otherUser: {
            _id: otherUser._id,
            name: otherUser.name,
            profileImage: otherUser.profileImage || '',
            role: otherUser.role
          },
          connection: serializeConnection(c.connection),
          lastMessageAt: c.lastMessageAt,
          lastMessageSnippet: c.lastMessageSnippet || '',
          lastMessageFromMe: !!c.lastMessageSender && idString(c.lastMessageSender) === idString(me),
          unreadCount: unreadById.get(idString(c._id)) || 0,
          isActive: activePairs.has(pairKey(c.elder, c.volunteer)) && otherUser.isActive !== false
        };
      });

    res.status(200).json({ success: true, count: data.length, data });
  } catch (error) {
    return serverError(res, 'Error fetching conversations', error);
  }
};

// @desc    Total unread messages for the caller (drives the tab badge)
// @route   GET /api/conversations/unread-count
// @access  Private — elders and approved volunteers
exports.getUnreadCount = async (req, res) => {
  try {
    const count = await Message.countDocuments({ recipient: req.user._id, isRead: false });
    res.status(200).json({ success: true, data: { count } });
  } catch (error) {
    return serverError(res, 'Error counting unread messages', error);
  }
};

// @desc    One conversation, with whether it is still open for new messages
// @route   GET /api/conversations/:id
// @access  Private — the two participants only
exports.getConversation = async (req, res) => {
  try {
    const access = await loadConversationFor(req.user, req.params.id);
    if (!access) return notFound(res);

    const { conversation, connection, otherUser, isActive } = access;
    res.status(200).json({
      success: true,
      data: {
        _id: conversation._id,
        otherUser: otherUser
          ? { _id: otherUser._id, name: otherUser.name, profileImage: otherUser.profileImage || '', role: otherUser.role }
          : null,
        connection: serializeConnection(connection),
        isActive
      }
    });
  } catch (error) {
    return serverError(res, 'Error fetching conversation', error);
  }
};

// @desc    Message history. With `after`, returns everything since that time
//          (used for live polling); otherwise the latest page, or the page
//          before `before` when scrolling back.
// @route   GET /api/conversations/:id/messages?after=&before=&limit=
// @access  Private — the two participants only
exports.getMessages = async (req, res) => {
  try {
    const access = await loadConversationFor(req.user, req.params.id);
    if (!access) return notFound(res);

    const conversationId = access.conversation._id;
    const after = parseDate(req.query.after);
    const before = parseDate(req.query.before);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || DEFAULT_PAGE_SIZE, 1), MAX_PAGE_SIZE);

    let messages;
    let hasMore = false;

    if (after) {
      // $gte, not $gt: two messages can share a millisecond, and the client
      // de-duplicates by id, so re-sending the boundary message is harmless.
      messages = await Message.find({ conversation: conversationId, createdAt: { $gte: after } })
        .sort({ createdAt: 1, _id: 1 })
        .limit(MAX_SYNC_BATCH)
        .lean();
      hasMore = messages.length === MAX_SYNC_BATCH;
    } else {
      const filter = { conversation: conversationId };
      if (before) filter.createdAt = { $lt: before };
      const page = await Message.find(filter)
        .sort({ createdAt: -1, _id: -1 })
        .limit(limit + 1)
        .lean();
      hasMore = page.length > limit;
      messages = page.slice(0, limit).reverse();
    }

    res.status(200).json({
      success: true,
      data: {
        messages: messages.map(serializeMessage),
        hasMore,
        isActive: access.isActive
      }
    });
  } catch (error) {
    return serverError(res, 'Error fetching messages', error);
  }
};

// @desc    Send a message
// @route   POST /api/conversations/:id/messages
// @access  Private — participants of a currently approved connection only
exports.sendMessage = async (req, res) => {
  try {
    const access = await loadConversationFor(req.user, req.params.id);
    if (!access) return notFound(res);

    if (!access.isActive) {
      return res.status(403).json({ success: false, isChatClosed: true, message: CLOSED_CHAT_MESSAGE });
    }

    const content = typeof req.body.content === 'string' ? req.body.content.trim() : '';
    if (!content) {
      return res.status(400).json({ success: false, message: 'Please type a message before sending.' });
    }
    if (content.length > Message.MAX_LENGTH) {
      return res.status(400).json({
        success: false,
        message: `Messages cannot exceed ${Message.MAX_LENGTH} characters.`
      });
    }

    const clientId =
      typeof req.body.clientId === 'string' && req.body.clientId.trim()
        ? req.body.clientId.trim().slice(0, 64)
        : undefined;

    const { conversation, connection } = access;
    const me = req.user._id;
    const recipient = idString(conversation.elder) === idString(me) ? conversation.volunteer : conversation.elder;

    // A retry of a send that already reached the server returns the original.
    if (clientId) {
      const existing = await Message.findOne({ sender: me, clientId }).lean();
      if (existing) {
        if (idString(existing.conversation) !== idString(conversation._id)) {
          return res.status(409).json({ success: false, message: 'Duplicate message id.' });
        }
        return res.status(200).json({ success: true, data: { message: serializeMessage(existing), isActive: true } });
      }
    }

    let message;
    try {
      message = await Message.create({ conversation: conversation._id, sender: me, recipient, content, clientId });
    } catch (err) {
      if (err.code === 11000 && clientId) {
        const existing = await Message.findOne({ sender: me, clientId }).lean();
        if (existing) {
          return res.status(200).json({ success: true, data: { message: serializeMessage(existing), isActive: true } });
        }
      }
      throw err;
    }

    await Conversation.updateOne(
      { _id: conversation._id },
      {
        $set: {
          connection: connection._id,
          lastMessageAt: message.createdAt,
          lastMessageSnippet: content.replace(/\s+/g, ' ').slice(0, SNIPPET_LENGTH),
          lastMessageSender: me
        }
      }
    );

    res.status(201).json({ success: true, data: { message: serializeMessage(message), isActive: true } });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ success: false, message: error.message });
    }
    return serverError(res, 'Error sending message', error);
  }
};

// @desc    Mark every message the caller has received in this chat as read
// @route   PUT /api/conversations/:id/read
// @access  Private — the two participants only
exports.markConversationRead = async (req, res) => {
  try {
    const access = await loadConversationFor(req.user, req.params.id);
    if (!access) return notFound(res);

    const result = await Message.updateMany(
      { conversation: access.conversation._id, recipient: req.user._id, isRead: false },
      { $set: { isRead: true, readAt: new Date() } }
    );

    res.status(200).json({ success: true, data: { updated: result.modifiedCount || 0 } });
  } catch (error) {
    return serverError(res, 'Error marking messages as read', error);
  }
};
