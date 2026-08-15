import { beforeAll, afterEach, afterAll } from 'vitest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

// Fallback test env vars so the suite works in CI without a real .env file.
// dotenv.config() (called when app.js loads) never overrides already-set vars, so this wins.
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret';
process.env.NODE_ENV = 'test';

// Force the mailer into console-stub mode even when a developer's local .env has real Gmail
// credentials — tests must never send real emails to made-up test addresses.
process.env.EMAIL_USER = '';
process.env.EMAIL_PASS = '';

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
}, 60000);

afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});
