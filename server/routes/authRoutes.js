import express from 'express';
import { registerUser, loginUser, forgotPassword, resetPassword, verifyOtp, resendOtp } from '../controllers/authController.js';
import { validate } from '../middleware/validate.js';
import { authLimiter } from '../middleware/rateLimiters.js';
import { registerSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema, verifyOtpSchema, resendOtpSchema } from '../validators/authValidators.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Registration, login and password reset
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new customer or seller account
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password]
 *             properties:
 *               name: { type: string }
 *               email: { type: string, format: email }
 *               password: { type: string, minLength: 6 }
 *               role: { type: string, enum: [customer, seller], default: customer }
 *     responses:
 *       201: { description: Registration pending — a verification code was emailed, no JWT is issued yet }
 *       400: { description: Validation failed or a verified account with this email already exists }
 */
router.post('/register', authLimiter, validate({ body: registerSchema }), registerUser);

/**
 * @swagger
 * /auth/verify-otp:
 *   post:
 *     summary: Verify the emailed OTP to activate a newly registered account
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, otp]
 *             properties:
 *               email: { type: string, format: email }
 *               otp: { type: string, description: "6-digit code" }
 *     responses:
 *       200: { description: Account verified, returns the user and a JWT }
 *       400: { description: Incorrect or expired code }
 */
router.post('/verify-otp', authLimiter, validate({ body: verifyOtpSchema }), verifyOtp);

/**
 * @swagger
 * /auth/resend-otp:
 *   post:
 *     summary: Resend the email verification code
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email: { type: string, format: email }
 *     responses:
 *       200: { description: A new code is emailed if the account exists and needs verification (response is the same either way) }
 */
router.post('/resend-otp', authLimiter, validate({ body: resendOtpSchema }), resendOtp);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Log in with email and password
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string, format: email }
 *               password: { type: string }
 *     responses:
 *       200: { description: Returns the user and a JWT }
 *       401: { description: Invalid credentials }
 */
router.post('/login', authLimiter, validate({ body: loginSchema }), loginUser);

/**
 * @swagger
 * /auth/forgot-password:
 *   post:
 *     summary: Request a password reset email
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email: { type: string, format: email }
 *     responses:
 *       200: { description: A reset link is emailed if the address is registered (response is the same either way) }
 */
router.post('/forgot-password', authLimiter, validate({ body: forgotPasswordSchema }), forgotPassword);

/**
 * @swagger
 * /auth/reset-password/{token}:
 *   post:
 *     summary: Set a new password using a reset token from the email link
 *     tags: [Auth]
 *     security: []
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [password]
 *             properties:
 *               password: { type: string, minLength: 6 }
 *     responses:
 *       200: { description: Password updated }
 *       400: { description: Reset link is invalid or has expired }
 */
router.post('/reset-password/:token', authLimiter, validate({ body: resetPasswordSchema }), resetPassword);

export default router;
