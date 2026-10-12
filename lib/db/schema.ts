import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';

// users logged into the app. password_hash is null for Google-only accounts.
export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash'),
  role: text('role').notNull().default('dispatcher'),
  image: text('image'),
  createdAt: integer('created_at', { mode: 'timestamp_ms' })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const customers = sqliteTable('customers', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull(),
  phone: text('phone'),
  address: text('address'),
  lat: real('lat'),
  lng: real('lng'),
  createdAt: integer('created_at', { mode: 'timestamp_ms' })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const technicians = sqliteTable('technicians', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull(),
  phone: text('phone'),
  role: text('role').notNull().default('Technician'),
  lat: real('lat'),
  lng: real('lng'),
  createdAt: integer('created_at', { mode: 'timestamp_ms' })
    .notNull()
    .$defaultFn(() => new Date()),
});

// status: pending | in_progress | completed | cancelled
export const jobs = sqliteTable('jobs', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description'),
  status: text('status').notNull().default('pending'),
  date: text('date').notNull(),
  customerId: text('customer_id').references(() => customers.id),
  technicianId: text('technician_id').references(() => technicians.id),
  lat: real('lat'),
  lng: real('lng'),
  createdAt: integer('created_at', { mode: 'timestamp_ms' })
    .notNull()
    .$defaultFn(() => new Date()),
});

// status: unpaid | paid | overdue
export const invoices = sqliteTable('invoices', {
  id: text('id').primaryKey(),
  customerId: text('customer_id').references(() => customers.id),
  amount: real('amount').notNull(),
  status: text('status').notNull().default('unpaid'),
  date: text('date').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp_ms' })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const invoiceItems = sqliteTable('invoice_items', {
  id: text('id').primaryKey(),
  invoiceId: text('invoice_id')
    .notNull()
    .references(() => invoices.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  price: real('price').notNull(),
});

export type UserRow = typeof users.$inferSelect;
export type CustomerRow = typeof customers.$inferSelect;
export type TechnicianRow = typeof technicians.$inferSelect;
export type JobRow = typeof jobs.$inferSelect;
export type InvoiceRow = typeof invoices.$inferSelect;
export type InvoiceItemRow = typeof invoiceItems.$inferSelect;
