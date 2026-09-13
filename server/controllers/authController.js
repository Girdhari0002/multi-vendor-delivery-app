import User from '../models/User.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { sendEmail } from '../services/mailer.js';

const OTP_EXPIRY_MS = 10 * 60 * 1000; // 10 minutes
const MAX_OTP_ATTEMPTS = 5;

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '1d' });
};

const setAuthCookie = (res, userId) => {
  res.cookie('token', generateToken(userId), {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
    maxAge: 24 * 60 * 60 * 1000,
  });
};
// Generates a fresh 6-digit OTP on the given user doc, resets the attempt counter, and emails it.
// Does not save the user — caller is expected to call user.save() (kept this way so registerUser
// can set the OTP and persist the new user in a single save()).
const issueOtp = async (user) => {
  const otp = crypto.randomInt(100000, 1000000).toString();
  user.otp = otp;
  user.otpExpires = new Date(Date.now() + OTP_EXPIRY_MS);
  user.otpAttempts = 0;

  await sendEmail({
    to: user.email,
    subject: 'Verify your email',
    html: `
      <p>Hi ${user.name},</p>
      <p>Your verification code is:</p>
      <p style="font-size: 28px; font-weight: bold; letter-spacing: 4px;">${otp}</p>
      <p>This code expires in 10 minutes. If you didn't request this, you can ignore this email.</p>
    `,
  });
};

export const registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists && userExists.isVerified) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Defense in depth: even though validation restricts this, never trust client-supplied role for privileged accounts.
    const userRole = ['customer', 'seller'].includes(role) ? role : 'customer';

    // If an unverified account with this email already exists (e.g. they abandoned the OTP
    // step last time), reuse and update it rather than blocking the retry.
    const user = userExists || new User({ email });
    user.name = name;
    user.password = hashedPassword;
    user.role = userRole;
    user.isVerified = false;

    await issueOtp(user);
    await user.save();

    res.status(201).json({
      message: 'Registration successful. Please check your email for a verification code.',
      email: user.email,
    });
  } catch (error) {
    // Duplicate-key race: two concurrent submits (e.g. a double-click) for the same brand-new
    // email both pass the findOne check before either has saved. The loser hits the unique
    // index instead of crashing with a raw 500 — the winner already sent the OTP, so this is
    // a normal outcome, not an error.
    if (error.code === 11000 && error.keyPattern?.email) {
      return res.status(201).json({
        message: 'Registration successful. Please check your email for a verification code.',
        email: req.body.email,
      });
    }
     console.log(error);
    res.status(500).json({ message: error.message });
  }
};

// POST /api/auth/verify-otp
export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or verification code' });
    }
    if (user.isVerified) {
      return res.status(400).json({ message: 'This account is already verified. Please log in.' });
    }
    if (!user.otp || !user.otpExpires || user.otpExpires < new Date()) {
      return res.status(400).json({ message: 'Verification code has expired. Please request a new one.' });
    }
    if (user.otpAttempts >= MAX_OTP_ATTEMPTS) {
      return res.status(400).json({ message: 'Too many incorrect attempts. Please request a new code.' });
    }
    if (user.otp !== otp) {
      user.otpAttempts += 1;
      await user.save();
      return res.status(400).json({ message: 'Incorrect verification code' });
    }

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    user.otpAttempts = 0;
    await user.save();

    setAuthCookie(res, user._id);

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/auth/resend-otp
export const resendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    // Same neutral response whether or not the account exists / is already verified,
    // so this endpoint can't be used to probe which emails are registered.
    const genericResponse = { message: 'If that account needs verification, a new code has been sent.' };

    if (!user || user.isVerified) {
      return res.json(genericResponse);
    }

    await issueOtp(user);
    await user.save();

    res.json(genericResponse);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    if (user.isBlocked) {
      return res.status(403).json({ message: 'Your account is blocked by admin' });
    }

    if (!user.isVerified) {
      return res.status(403).json({
        message: 'Please verify your email before logging in.',
        needsVerification: true,
        email: user.email,
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    setAuthCookie(res, user._id);

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/auth/forgot-password
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    // Always respond the same way whether or not the user exists, to avoid leaking which emails are registered
    if (!user) {
      return res.json({ message: 'If an account with that email exists, a reset link has been sent.' });
    }

    const rawToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = crypto.createHash('sha256').update(rawToken).digest('hex');
    user.resetPasswordExpires = Date.now() + 30 * 60 * 1000; // 30 minutes
    await user.save();

    const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/reset-password/${rawToken}`;

    await sendEmail({
      to: user.email,
      subject: 'Reset your password',
      html: `
        <p>Hi ${user.name},</p>
        <p>You requested a password reset. Click the link below to set a new password. This link expires in 30 minutes.</p>
        <p><a href="${resetUrl}">${resetUrl}</a></p>
        <p>If you did not request this, you can safely ignore this email.</p>
      `,
    });

    res.json({ message: 'If an account with that email exists, a reset link has been sent.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/auth/reset-password/:token
export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Reset link is invalid or has expired' });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: 'Password has been reset successfully. You can now log in.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
