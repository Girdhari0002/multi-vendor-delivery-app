import { z } from 'zod';
import { objectId } from './common.js';

export const generatePayoutSchema = z.object({
  sellerId: objectId,
  commissionRate: z.coerce.number().min(0).max(100).optional(),
});
