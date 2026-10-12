import {
  pgTable,
  text,
  timestamp,
  doublePrecision,
} from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash'),
  role: text('role').notNull().default('dispatcher'),
  image: text('image'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const customers = pgTable('customers', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull(),
  phone: text('phone'),
  address: text('address'),
  lat: doublePrecision('lat'),
  lng: doublePrecision('lng'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const technicians = pgTable('technicians', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull(),
  phone: text('phone'),
  role: text('role').notNull().default('Technician'),
  lat: doublePrecision('lat'),
  lng: doublePrecision('lng'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

// status: pending | in_progress | completed | cancelled
export const jobs = pgTable('jobs', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description'),
  status: text('status').notNull().default('pending'),
  priority: text('priority').notNull().default('normal'),
  date: text('date').notNull(),
  customerId: text('customer_id').references(() => customers.id, { onDelete: 'cascade' }),
  technicianId: text('technician_id').references(() => technicians.id, { onDelete: 'set null' }),
  lat: doublePrecision('lat'),
  lng: doublePrecision('lng'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

// status: unpaid | paid | overdue
export const invoices = pgTable('invoices', {
  id: text('id').primaryKey(),
  customerId: text('customer_id').references(() => customers.id, { onDelete: 'set null' }),
  amount: doublePrecision('amount').notNull(),
  status: text('status').notNull().default('unpaid'),
  date: text('date').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const invoiceItems = pgTable('invoice_items', {
  id: text('id').primaryKey(),
  invoiceId: text('invoice_id')
    .notNull()
    .references(() => invoices.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  price: doublePrecision('price').notNull(),
});

// simple activity trail shown on the job detail page
export const jobEvents = pgTable('job_events', {
  id: text('id').primaryKey(),
  jobId: text('job_id')
    .notNull()
    .references(() => jobs.id, { onDelete: 'cascade' }),
  type: text('type').notNull(),
  message: text('message').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export type UserRow = typeof users.$inferSelect;
export type CustomerRow = typeof customers.$inferSelect;
export type TechnicianRow = typeof technicians.$inferSelect;
export type JobRow = typeof jobs.$inferSelect;
export type InvoiceRow = typeof invoices.$inferSelect;
export type InvoiceItemRow = typeof invoiceItems.$inferSelect;
export type JobEventRow = typeof jobEvents.$inferSelect;
