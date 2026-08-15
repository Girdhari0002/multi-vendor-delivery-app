import { describe, it, expect } from 'vitest';
import mongoose from 'mongoose';
import User from '../models/User.js';
import { runStartupMigrations } from '../config/migrations.js';

describe('runStartupMigrations', () => {
  it('backfills isVerified=true for users stored before that field existed', async () => {
    // Insert via the raw driver to bypass Mongoose's schema defaults, simulating a legacy document.
    const { insertedId } = await mongoose.connection.collection('users').insertOne({
      name: 'Legacy User',
      email: 'legacy@example.com',
      password: 'hashed',
      role: 'customer',
    });

    await runStartupMigrations();

    const migrated = await User.findById(insertedId);
    expect(migrated.isVerified).toBe(true);
  });

  it('does not override isVerified for accounts that already have it set to false', async () => {
    const user = await User.create({
      name: 'Pending User',
      email: 'pending@example.com',
      password: 'hashed',
      role: 'customer',
      isVerified: false,
    });

    await runStartupMigrations();

    const stillPending = await User.findById(user._id);
    expect(stillPending.isVerified).toBe(false);
  });
});
