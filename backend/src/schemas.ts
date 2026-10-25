import { z } from 'zod';

export const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const vehicleInputSchema = z.object({
  make: z.string().trim().min(1),
  model: z.string().trim().min(1),
  category: z.string().trim().min(1),
  price: z.number().positive(),
  quantity: z.number().int().min(0),
});
export type VehicleInput = z.infer<typeof vehicleInputSchema>;

export const searchQuerySchema = z.object({
  make: z.string().optional(),
  model: z.string().optional(),
  category: z.string().optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
});
export type SearchFilters = z.infer<typeof searchQuerySchema>;

export const vehicleUpdateSchema = vehicleInputSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, { message: 'At least one field is required' });
export type VehicleUpdate = z.infer<typeof vehicleUpdateSchema>;

export const purchaseSchema = z.object({
  quantity: z.number().int().positive().default(1),
});

export const restockSchema = z.object({
  quantity: z.number().int().positive(),
});