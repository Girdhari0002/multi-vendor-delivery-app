import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import * as userController from '../controllers/userController.js';
import { validate } from '../middleware/validate.js';
import { idParamSchema } from '../validators/common.js';
import {
  updateProfileSchema,
  changePasswordSchema,
  addressSchema,
  notificationPrefsSchema,
} from '../validators/userValidators.js';

const router = express.Router();

// Profile Routes
router.get('/profile', protect, userController.getUserProfile);
router.put('/profile', protect, validate({ body: updateProfileSchema }), userController.updateUserProfile);
router.put('/change-password', protect, validate({ body: changePasswordSchema }), userController.changePassword);

// Address Routes
router.get('/addresses', protect, userController.getUserAddresses);
router.post('/addresses', protect, validate({ body: addressSchema }), userController.addAddress);
router.put('/addresses/:id', protect, validate({ params: idParamSchema, body: addressSchema }), userController.updateAddress);
router.delete('/addresses/:id', protect, validate({ params: idParamSchema }), userController.deleteAddress);

// Notification Preferences
router.get('/notification-prefs', protect, userController.getNotificationPrefs);
router.put('/notification-prefs', protect, validate({ body: notificationPrefsSchema }), userController.updateNotificationPrefs);

// Wishlist
router.get('/wishlist', protect, userController.getWishlist);
router.post('/wishlist/:id', protect, validate({ params: idParamSchema }), userController.addToWishlist);
router.delete('/wishlist/:id', protect, validate({ params: idParamSchema }), userController.removeFromWishlist);

// Account Management
router.delete('/account', protect, userController.deleteAccount);

export default router;
