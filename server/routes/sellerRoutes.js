import express from 'express';
import { protect, role } from '../middleware/authMiddleware.js';
import * as sellerController from '../controllers/sellerController.js';
import { getSellerPayouts } from '../controllers/payoutController.js';
import { validate } from '../middleware/validate.js';
import { updateSellerProfileSchema, updatePaymentInfoSchema } from '../validators/sellerValidators.js';

const router = express.Router();

// Seller Profile Routes
router.get('/profile', protect, role('seller'), sellerController.getSellerProfile);
router.put('/profile', protect, role('seller'), validate({ body: updateSellerProfileSchema }), sellerController.updateSellerProfile);

// Payment Information
router.get('/payment-info', protect, role('seller'), sellerController.getPaymentInfo);
router.put('/payment-info', protect, role('seller'), validate({ body: updatePaymentInfoSchema }), sellerController.updatePaymentInfo);

// Store Stats
router.get('/stats', protect, role('seller'), sellerController.getSellerStats);

// Payouts
router.get('/payouts', protect, role('seller'), getSellerPayouts);

export default router;
