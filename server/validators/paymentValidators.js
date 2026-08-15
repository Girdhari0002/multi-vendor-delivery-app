import { z } from 'zod';
import { objectId } from './common.js';

export const createPaymentOrderSchema = z.object({
  amount: z.coerce.number().positive('Amount must be greater than 0'),
});

export const verifyPaymentSchema = z.object({
  razorpay_order_id: z.string().min(1),
  razorpay_payment_id: z.string().min(1),
  razorpay_signature: z.string().min(1),
  orderId: objectId.optional(),
});

export const refundPaymentSchema = z.object({
  amount: z.coerce.number().positive().optional(),
  notes: z.string().trim().max(500).optional(),
});
