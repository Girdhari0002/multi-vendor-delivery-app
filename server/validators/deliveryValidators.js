import { z } from 'zod';

export const updateLocationSchema = z.object({
  lat: z.coerce.number().min(-90).max(90),
  lng: z.coerce.number().min(-180).max(180),
});

export const createDeliveryAgentSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(6).max(72),
  phone: z.string().trim().max(20).optional(),
  vehicleType: z.string().trim().max(50).optional(),
  vehicleNumber: z.string().trim().max(30).optional(),
});

export const assignAgentSchema = z.object({
  agentId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid agent id'),
});
