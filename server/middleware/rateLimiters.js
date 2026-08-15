import rateLimit from 'express-rate-limit';

// Integration tests fire many requests from the same supertest "IP" in quick succession,
// which isn't the brute-force pattern these limiters exist to catch — skip limiting in tests.
const skipInTest = () => process.env.NODE_ENV === 'test';

// General API limiter - applies to all requests
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  skip: skipInTest,
  message: { message: 'Too many requests, please try again later.' },
});

// Stricter limiter for auth endpoints (login/register/password reset) to slow brute-force attempts
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  skip: skipInTest,
  message: { message: 'Too many attempts, please try again later.' },
});
