import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../app.js';
import User from '../models/User.js';

const getOtp = async (email) => {
  const user = await User.findOne({ email });
  return user.otp;
};

describe('POST /api/auth/register', () => {
  it('registers a new customer as unverified and does not return a token', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
    });

    expect(res.status).toBe(201);
    expect(res.body.email).toBe('test@example.com');
    expect(res.body.token).toBeUndefined();

    const user = await User.findOne({ email: 'test@example.com' });
    expect(user.isVerified).toBe(false);
    expect(user.otp).toMatch(/^\d{6}$/);
  });

  it('rejects a public registration attempt with role=admin', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Sneaky Admin',
      email: 'sneaky@example.com',
      password: 'password123',
      role: 'admin',
    });

    // Validation rejects the disallowed role outright
    expect(res.status).toBe(400);
  });

  it('rejects a weak password', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Test User',
      email: 'weak@example.com',
      password: '123',
    });

    expect(res.status).toBe(400);
    expect(res.body.errors).toBeDefined();
  });

  it('rejects re-registering an already-verified email', async () => {
    await request(app).post('/api/auth/register').send({
      name: 'Verified User', email: 'verified@example.com', password: 'password123',
    });
    const otp = await getOtp('verified@example.com');
    await request(app).post('/api/auth/verify-otp').send({ email: 'verified@example.com', otp });

    const res = await request(app).post('/api/auth/register').send({
      name: 'Verified User Again', email: 'verified@example.com', password: 'password123',
    });

    expect(res.status).toBe(400);
  });

  it('allows re-registering an email that never completed OTP verification', async () => {
    await request(app).post('/api/auth/register').send({
      name: 'Abandoned', email: 'abandoned@example.com', password: 'password123',
    });

    const res = await request(app).post('/api/auth/register').send({
      name: 'Retried', email: 'abandoned@example.com', password: 'password123',
    });

    expect(res.status).toBe(201);
    const user = await User.findOne({ email: 'abandoned@example.com' });
    expect(user.name).toBe('Retried');
  });
});

describe('POST /api/auth/verify-otp', () => {
  it('activates the account and returns a token on a correct code', async () => {
    await request(app).post('/api/auth/register').send({
      name: 'OTP User', email: 'otpuser@example.com', password: 'password123',
    });
    const otp = await getOtp('otpuser@example.com');

    const res = await request(app).post('/api/auth/verify-otp').send({ email: 'otpuser@example.com', otp });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
    const user = await User.findOne({ email: 'otpuser@example.com' });
    expect(user.isVerified).toBe(true);
    expect(user.otp).toBeUndefined();
  });

  it('rejects an incorrect code', async () => {
    await request(app).post('/api/auth/register').send({
      name: 'OTP User', email: 'otpwrong@example.com', password: 'password123',
    });

    const res = await request(app).post('/api/auth/verify-otp').send({ email: 'otpwrong@example.com', otp: '000000' });

    expect(res.status).toBe(400);
    const user = await User.findOne({ email: 'otpwrong@example.com' });
    expect(user.isVerified).toBe(false);
    expect(user.otpAttempts).toBe(1);
  });

  it('rejects a code after it has expired', async () => {
    await request(app).post('/api/auth/register').send({
      name: 'OTP User', email: 'otpexpired@example.com', password: 'password123',
    });
    const otp = await getOtp('otpexpired@example.com');
    await User.updateOne({ email: 'otpexpired@example.com' }, { otpExpires: new Date(Date.now() - 1000) });

    const res = await request(app).post('/api/auth/verify-otp').send({ email: 'otpexpired@example.com', otp });

    expect(res.status).toBe(400);
  });
});

describe('POST /api/auth/resend-otp', () => {
  it('issues a new code that replaces the old one', async () => {
    await request(app).post('/api/auth/register').send({
      name: 'Resend User', email: 'resend@example.com', password: 'password123',
    });
    const firstOtp = await getOtp('resend@example.com');

    const resendRes = await request(app).post('/api/auth/resend-otp').send({ email: 'resend@example.com' });
    expect(resendRes.status).toBe(200);

    const secondOtp = await getOtp('resend@example.com');
    expect(secondOtp).not.toBe(firstOtp);

    // The old code no longer works
    const failed = await request(app).post('/api/auth/verify-otp').send({ email: 'resend@example.com', otp: firstOtp });
    expect(failed.status).toBe(400);

    // The new code does
    const success = await request(app).post('/api/auth/verify-otp').send({ email: 'resend@example.com', otp: secondOtp });
    expect(success.status).toBe(200);
  });

  it('returns the same generic response for an unknown email (no account enumeration)', async () => {
    const res = await request(app).post('/api/auth/resend-otp').send({ email: 'doesnotexist@example.com' });
    expect(res.status).toBe(200);
  });
});

describe('POST /api/auth/login', () => {
  it('rejects login before the account is verified', async () => {
    await request(app).post('/api/auth/register').send({
      name: 'Unverified', email: 'unverified@example.com', password: 'password123',
    });

    const res = await request(app).post('/api/auth/login').send({
      email: 'unverified@example.com', password: 'password123',
    });

    expect(res.status).toBe(403);
    expect(res.body.needsVerification).toBe(true);
  });

  it('logs in with correct credentials after verification', async () => {
    await request(app).post('/api/auth/register').send({
      name: 'Login User', email: 'login@example.com', password: 'password123',
    });
    const otp = await getOtp('login@example.com');
    await request(app).post('/api/auth/verify-otp').send({ email: 'login@example.com', otp });

    const res = await request(app).post('/api/auth/login').send({
      email: 'login@example.com',
      password: 'password123',
    });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
  });

  it('rejects incorrect password for a verified account', async () => {
    await request(app).post('/api/auth/register').send({
      name: 'Login User', email: 'login2@example.com', password: 'password123',
    });
    const otp = await getOtp('login2@example.com');
    await request(app).post('/api/auth/verify-otp').send({ email: 'login2@example.com', otp });

    const res = await request(app).post('/api/auth/login').send({
      email: 'login2@example.com',
      password: 'wrongpassword',
    });

    expect(res.status).toBe(401);
  });
});
