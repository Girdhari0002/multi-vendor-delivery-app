import { z } from 'zod';

export const createProductSchema = z.object({
  title: z.string().trim().min(2, 'Title must be at least 2 characters').max(200),
  description: z.string().trim().min(1, 'Description is required').max(5000),
  price: z.coerce.number().positive('Price must be greater than 0'),
  category: z.string().trim().min(1, 'Category is required'),
  stock: z.coerce.number().int().min(0, 'Stock cannot be negative'),
  imageUrl: z.string().trim().url().optional().or(z.literal('')),
});

export const updateProductSchema = createProductSchema.partial();

export const productQuerySchema = z.object({
  keyword: z.string().trim().optional(),
  category: z.string().trim().optional(),
  minPrice: z.coerce.number().nonnegative().optional(),
  maxPrice: z.coerce.number().nonnegative().optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  // Capped at 1000 (not 100) so seller/admin "manage products" dashboards can request their
  // full catalog in one page (they pass limit=1000) without tripping validation.
  limit: z.coerce.number().int().positive().max(1000).optional().default(12),
  sort: z.enum(['newest', 'price_asc', 'price_desc', 'rating']).optional(),
});
