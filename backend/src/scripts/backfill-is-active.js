/**
 * One-off migration for commit 4ed85e6, which added `isActive` to the User schema.
 *
 * User documents written before that commit have no `isActive` key stored at all.
 * Mongoose hides this by applying the schema default on hydration, but raw queries
 * such as countDocuments({ isActive: true }) skip those documents entirely. This
 * script writes the default explicitly so the stored data matches the schema.
 *
 * Run once per environment (local, staging, production):
 *   node src/scripts/backfill-is-active.js
 *
 * Idempotent -- the $exists guard means a second run matches nothing. Users an
 * admin deliberately deactivated already have isActive: false stored and are
 * left untouched. Safe to delete once every environment has been migrated.
 */

const mongoose = require('mongoose');
require('dotenv').config();

const User = require('../models/User');

const MONGODB_URI = process.env.MONGODB_URI;

async function backfill() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const missing = await User.countDocuments({ isActive: { $exists: false } });
    console.log(`Users missing the isActive field: ${missing}`);

    if (missing === 0) {
      console.log('Nothing to backfill -- every user already has isActive stored.');
      await mongoose.disconnect();
      process.exit(0);
    }

    const result = await User.updateMany(
      { isActive: { $exists: false } },
      { $set: { isActive: true } }
    );

    console.log(`Backfilled isActive: true on ${result.modifiedCount} user(s)`);

    const remaining = await User.countDocuments({ isActive: { $exists: false } });
    console.log(`Users still missing the field: ${remaining}`);

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Error backfilling isActive:', err);
    process.exit(1);
  }
}

backfill();
