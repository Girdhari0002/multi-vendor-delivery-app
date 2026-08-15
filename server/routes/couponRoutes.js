import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';
import { validate } from '../middleware/validate.js';
import { idParamSchema } from '../validators/common.js';
import { createCouponSchema, updateCouponSchema, validateCouponSchema } from '../validators/couponValidators.js';
import * as couponController from '../controllers/couponController.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Coupons
 *   description: Discount codes
 */

/**
 * @swagger
 * /coupons/validate:
 *   post:
 *     summary: Validate a coupon code against an order total (used at checkout)
 *     tags: [Coupons]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [code, orderTotal]
 *             properties:
 *               code: { type: string }
 *               orderTotal: { type: number }
 *     responses:
 *       200: { description: Coupon is valid, returns the discount amount }
 *       400: { description: Coupon is invalid, expired, or below the minimum order value }
 */
router.post('/validate', protect, validate({ body: validateCouponSchema }), couponController.validateCoupon);

router.use(protect, authorizeRoles('admin'));

/**
 * @swagger
 * /coupons:
 *   get:
 *     summary: List all coupons (admin)
 *     tags: [Coupons]
 *     responses:
 *       200: { description: List of coupons }
 *   post:
 *     summary: Create a coupon (admin)
 *     tags: [Coupons]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [code, discountType, discountValue]
 *             properties:
 *               code: { type: string }
 *               discountType: { type: string, enum: [flat, percent] }
 *               discountValue: { type: number }
 *               maxDiscount: { type: number }
 *               minOrderValue: { type: number }
 *               expiryDate: { type: string, format: date }
 *               usageLimit: { type: integer }
 *     responses:
 *       201: { description: Coupon created }
 */
router.get('/', couponController.getCoupons);
router.post('/', validate({ body: createCouponSchema }), couponController.createCoupon);
router.put('/:id', validate({ params: idParamSchema, body: updateCouponSchema }), couponController.updateCoupon);
router.delete('/:id', validate({ params: idParamSchema }), couponController.deleteCoupon);

export default router;
