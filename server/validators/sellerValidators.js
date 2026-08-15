import { z } from 'zod';

export const updateSellerProfileSchema = z.object({
  businessName: z.string().trim().max(200).optional(),
  businessType: z.string().trim().max(100).optional(),
  gstNumber: z.string().trim().max(30).optional(),
  storeDescription: z.string().trim().max(2000).optional(),
  storeLogo: z.string().trim().url().optional().or(z.literal('')),
  storeStatus: z.enum(['active', 'inactive']).optional(),
});

export const updatePaymentInfoSchema = z.object({
  accountNumber: z.string().trim().max(30).optional(),
  ifsc: z.string().trim().max(15).optional(),
  bankName: z.string().trim().max(100).optional(),
  upiId: z.string().trim().max(100).optional(),
});
