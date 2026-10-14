import { z } from 'zod';

export const jobStatusSchema = z.enum([
  'pending',
  'in_progress',
  'completed',
  'cancelled',
]);

export const jobPrioritySchema = z.enum(['low', 'normal', 'high', 'urgent']);

export const invoiceStatusSchema = z.enum(['unpaid', 'paid', 'overdue']);

export const createJobSchema = z.object({
  title: z.string().trim().min(3).max(120),
  customerId: z.string().trim().min(1),
  description: z.string().trim().max(1000).optional(),
  status: jobStatusSchema.optional(),
  priority: jobPrioritySchema.optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  technicianId: z.string().trim().min(1).nullable().optional(),
});

export const updateJobSchema = z.object({
  title: z.string().trim().min(3).max(120).optional(),
  customerId: z.string().trim().min(1).optional(),
  description: z.string().trim().max(1000).nullable().optional(),
  status: jobStatusSchema.optional(),
  priority: jobPrioritySchema.optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  technicianId: z.string().trim().min(1).nullable().optional(),
});

export const createCustomerSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email(),
  phone: z.string().trim().max(30).optional(),
  address: z.string().trim().max(200).optional(),
});

export const updateCustomerSchema = createCustomerSchema.partial();

export const createTechnicianSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email(),
  phone: z.string().trim().max(30).optional(),
  role: z.string().trim().max(60).optional(),
});

export const updateTechnicianSchema = createTechnicianSchema.partial();

export const createInvoiceSchema = z.object({
  customerId: z.string().trim().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  status: invoiceStatusSchema.optional(),
  items: z
    .array(
      z.object({
        name: z.string().trim().min(1).max(120),
        price: z.coerce.number().min(0),
      }),
    )
    .min(1),
});

export const updateInvoiceSchema = z.object({
  status: invoiceStatusSchema,
});

export const userRoleSchema = z.enum(['admin', 'dispatcher', 'technician']);

export const signupSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email(),
  password: z.string().min(8).max(128),
  orgName: z.string().trim().min(2).max(120).optional(),
});

export const inviteSchema = z.object({
  email: z.string().trim().email(),
  role: userRoleSchema.default('technician'),
});

export const acceptInviteSchema = z.object({
  name: z.string().trim().min(2).max(120),
  password: z.string().min(8).max(128),
});

export const updateMemberRoleSchema = z.object({
  role: userRoleSchema,
});

// Chat rooms are 'general' (team channel) or 'job:<id>' (a job thread).
export const chatRoomIdSchema = z
  .string()
  .trim()
  .regex(/^(general|job:[A-Za-z0-9_-]+)$/);

export const createMessageSchema = z.object({
  roomId: chatRoomIdSchema,
  body: z.string().trim().min(1).max(2000),
});

export type CreateJobInput = z.infer<typeof createJobSchema>;
export type UpdateJobInput = z.infer<typeof updateJobSchema>;
export type CreateCustomerInput = z.infer<typeof createCustomerSchema>;
export type CreateTechnicianInput = z.infer<typeof createTechnicianSchema>;
export type CreateInvoiceInput = z.infer<typeof createInvoiceSchema>;
