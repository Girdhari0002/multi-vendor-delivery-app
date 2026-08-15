import { z } from 'zod';
import { objectId } from './common.js';

export const addReviewSchema = z.object({
  productId: objectId,
  rating: z.coerce.number().int().min(1, 'Rating must be between 1 and 5').max(5, 'Rating must be between 1 and 5'),
  comment: z.string().trim().max(2000).optional(),
});
