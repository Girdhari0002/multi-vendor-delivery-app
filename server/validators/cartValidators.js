import { z } from 'zod';
import { objectId } from './common.js';

export const addToCartSchema = z.object({
  productId: objectId,
  quantity: z.coerce.number().int().min(1, 'Quantity must be at least 1'),
});

export const removeFromCartSchema = z.object({
  productId: objectId,
});
