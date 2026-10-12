import { z } from 'zod';

export const jobStatusSchema = z.enum([
  'pending',
  'in_progress',
  'completed',
  'cancelled',
]);

export const createJobSchema = z.object({
  title: z.string().trim().min(3).max(120),
  customerId: z.string().trim().min(1),
  description: z.string().trim().max(1000).optional(),
  status: jobStatusSchema.optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  technicianId: z.string().trim().min(1).optional(),
});

export const updateJobSchema = z.object({
  status: jobStatusSchema,
});

export const createCustomerSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email(),
  phone: z.string().trim().max(30).optional(),
  address: z.string().trim().max(200).optional(),
});

export const signupSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email(),
  password: z.string().min(8).max(128),
});
