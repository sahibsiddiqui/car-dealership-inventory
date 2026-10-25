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