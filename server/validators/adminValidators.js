import { z } from 'zod';

export const platformSettingsSchema = z.object({
  deliveryCharge: z.coerce.number().nonnegative().optional(),
  codCharge: z.coerce.number().nonnegative().optional(),
  codAvailable: z.boolean().optional(),
  taxRate: z.coerce.number().nonnegative().optional(),
});

export const updateSellerStatusSchema = z.object({
  storeStatus: z.enum(['active', 'inactive']).optional(),
});
