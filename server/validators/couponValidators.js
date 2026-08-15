import { z } from 'zod';

export const createCouponSchema = z.object({
  code: z.string().trim().min(3).max(30),
  discountType: z.enum(['flat', 'percent']),
  discountValue: z.coerce.number().positive(),
  maxDiscount: z.coerce.number().positive().optional(),
  minOrderValue: z.coerce.number().nonnegative().optional(),
  expiryDate: z.coerce.date().optional(),
  usageLimit: z.coerce.number().int().positive().optional(),
  active: z.boolean().optional(),
});

export const updateCouponSchema = createCouponSchema.partial();

export const validateCouponSchema = z.object({
  code: z.string().trim().min(1, 'Coupon code is required'),
  orderTotal: z.coerce.number().nonnegative(),
});
