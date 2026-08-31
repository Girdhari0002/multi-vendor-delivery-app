import { z } from 'zod';

export const updateSellerProfileSchema = z.object({
  businessName: z.string().trim().max(200).optional(),
  businessType: z.string().trim().max(100).optional(),
  gstNumber: z.string().trim().max(30).optional(),
  // Contact number the courier partner uses to reach the seller for pickup.
  phone: z.string().trim().max(20).optional(),
  storeDescription: z.string().trim().max(2000).optional(),
  storeLogo: z.string().trim().url().optional().or(z.literal('')),
  storeStatus: z.enum(['active', 'inactive']).optional(),
  // Pickup location for courier bookings (e.g. Borzo) on this seller's shipped orders.
  storeAddress: z.object({
    street: z.string().trim().max(200).optional(),
    city: z.string().trim().max(100).optional(),
    state: z.string().trim().max(100).optional(),
    zip: z.string().trim().max(20).optional(),
    country: z.string().trim().max(100).optional(),
  }).optional(),
});

export const updatePaymentInfoSchema = z.object({
  accountNumber: z.string().trim().max(30).optional(),
  ifsc: z.string().trim().max(15).optional(),
  bankName: z.string().trim().max(100).optional(),
  upiId: z.string().trim().max(100).optional(),
});
