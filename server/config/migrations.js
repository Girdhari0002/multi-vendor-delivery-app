import User from '../models/User.js';
import logger from './logger.js';

// Lightweight, idempotent startup migrations — safe to run on every boot (each is a no-op
// once applied). This project doesn't use a migration framework, so this is the one place
// schema changes that need a data backfill get applied automatically in every environment.
export const runStartupMigrations = async () => {
  // Added when email OTP verification shipped: accounts created before this field existed
  // must not be silently treated as unverified (Mongoose applies the `isVerified` schema
  // default even to documents that don't have the field stored), which would lock every
  // pre-existing user out of login.
  const result = await User.updateMany(
    { isVerified: { $exists: false } },
    { $set: { isVerified: true } }
  );
  if (result.modifiedCount > 0) {
    logger.info(`Migration: backfilled isVerified=true for ${result.modifiedCount} pre-existing user(s)`);
  }
};
