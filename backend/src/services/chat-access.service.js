const mongoose = require('mongoose');
const Appointment = require('../models/Appointment');
const Conversation = require('../models/Conversation');
const User = require('../models/User');

/**
 * Appointment statuses that count as an approved, live elder–volunteer
 * connection. A pending request has no volunteer yet; once a visit is completed
 * or cancelled the chat stays readable but locks for new messages.
 */
const ACTIVE_CONNECTION_STATUSES = ['accepted', 'in_progress', 'in-progress'];

const CHAT_ROLES = ['elderly', 'senior', 'volunteer'];

const toId = (value) => (value && value._id ? value._id : value);
const idString = (value) => (value ? String(toId(value)) : '');
const pairKey = (elderId, volunteerId) => `${idString(elderId)}:${idString(volunteerId)}`;

const isVolunteer = (user) => user && user.role === 'volunteer';
const userIdOf = (user) => user && (user._id || user.id);

/** The conversation field that holds this user, given their role. */
const ownField = (user) => (isVolunteer(user) ? 'volunteer' : 'elder');
const otherField = (user) => (isVolunteer(user) ? 'elder' : 'volunteer');

const isParticipant = (user, conversation) => {
  const me = idString(userIdOf(user));
  return !!me && (idString(conversation.elder) === me || idString(conversation.volunteer) === me);
};

/** Approved appointments involving the user, newest first. */
const findActiveConnectionsFor = (user) => {
  const field = isVolunteer(user) ? 'provider' : 'requester';
  return Appointment.find({
    [field]: userIdOf(user),
    status: { $in: ACTIVE_CONNECTION_STATUSES },
    requester: { $ne: null },
    provider: { $ne: null }
  })
    .select('_id requester provider status title taskType updatedAt')
    .sort({ updatedAt: -1 })
    .lean();
};

/** The newest approved appointment between one elder and one volunteer, or null. */
const findActiveConnection = (elderId, volunteerId) =>
  Appointment.findOne({
    requester: toId(elderId),
    provider: toId(volunteerId),
    status: { $in: ACTIVE_CONNECTION_STATUSES }
  })
    .select('_id requester provider status title taskType updatedAt')
    .sort({ updatedAt: -1 })
    .lean();

/**
 * Makes sure every approved connection the user has is backed by a
 * conversation, pointing at that pair's newest approved appointment.
 *
 * Runs on each inbox load, so a request accepted a moment ago shows up as a
 * chat without the approval flow needing to know about messaging. Returns the
 * set of pair keys that are currently active.
 */
const syncConversationsFor = async (user) => {
  const connections = await findActiveConnectionsFor(user);
  const newestByPair = new Map();
  for (const appt of connections) {
    const key = pairKey(appt.requester, appt.provider);
    if (!newestByPair.has(key)) newestByPair.set(key, appt);
  }

  if (newestByPair.size > 0) {
    const ops = [...newestByPair.values()].map((appt) => ({
      updateOne: {
        filter: { elder: toId(appt.requester), volunteer: toId(appt.provider) },
        update: { $set: { connection: appt._id } },
        upsert: true
      }
    }));
    try {
      await Conversation.bulkWrite(ops, { ordered: false });
    } catch (err) {
      // Two requests upserting the same new pair at once: the loser hits the
      // unique index, but the conversation exists either way.
      const codes = err.writeErrors ? err.writeErrors.map((e) => e.code) : [err.code];
      if (!codes.every((code) => code === 11000)) throw err;
    }
  }

  return new Set(newestByPair.keys());
};

/**
 * Loads a conversation the caller belongs to, plus whether it is open for new
 * messages right now. Responds with `null` when the id is malformed, missing,
 * or belongs to another pair — callers answer 404 in every case so outsiders
 * can't probe which conversation ids exist.
 */
const loadConversationFor = async (user, conversationId) => {
  if (!mongoose.Types.ObjectId.isValid(conversationId)) return null;

  const conversation = await Conversation.findById(conversationId);
  if (!conversation || !isParticipant(user, conversation)) return null;

  const [connection, otherUser] = await Promise.all([
    findActiveConnection(conversation.elder, conversation.volunteer),
    User.findById(conversation[otherField(user)]).select('_id name profileImage role isActive').lean()
  ]);

  const isActive = !!connection && !!otherUser && otherUser.isActive !== false;
  return { conversation, connection, otherUser, isActive };
};

module.exports = {
  ACTIVE_CONNECTION_STATUSES,
  CHAT_ROLES,
  idString,
  pairKey,
  ownField,
  otherField,
  isParticipant,
  findActiveConnection,
  syncConversationsFor,
  loadConversationFor
};
