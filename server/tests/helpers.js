import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Creates a user directly in the test database and returns { user, token } for authenticated requests,
// bypassing the public /register endpoint (which cannot create admin/delivery accounts, and to avoid
// spending the auth rate limiter's request budget across many tests).
export const createUserAndToken = async (overrides = {}) => {
  const password = overrides.password || 'password123';
  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    name: 'Test User',
    email: `user-${Date.now()}-${Math.random().toString(36).slice(2)}@example.com`,
    role: 'customer',
    isVerified: true,
    ...overrides,
    password: hashedPassword,
  });

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
  return { user, token };
};
