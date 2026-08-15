import { z } from 'zod';

export const updateProfileSchema = z.object({
  name: z.string().trim().min(2).max(100).optional(),
  phone: z.string().trim().max(20).optional(),
  dateOfBirth: z.coerce.date().optional(),
  gender: z.string().trim().max(20).optional(),
  profilePicture: z.string().trim().url().optional().or(z.literal('')),
});

export const changePasswordSchema = z.object({
  oldPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters').max(72),
});

export const addressSchema = z.object({
  label: z.enum(['Home', 'Work', 'Other']).optional(),
  street: z.string().trim().min(1, 'Street is required'),
  city: z.string().trim().min(1, 'City is required'),
  state: z.string().trim().min(1, 'State is required'),
  zip: z.string().trim().min(1, 'Zip is required'),
  country: z.string().trim().optional(),
  isDefault: z.boolean().optional(),
});

export const notificationPrefsSchema = z.object({
  email: z.boolean().optional(),
  sms: z.boolean().optional(),
  push: z.boolean().optional(),
});
