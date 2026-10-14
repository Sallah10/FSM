import {
  pgTable,
  primaryKey,
  text,
  timestamp,
  doublePrecision,
} from 'drizzle-orm/pg-core';

// A workspace/tenant. Every business that signs up gets its own organization,
// and all customers/technicians/jobs/invoices belong to exactly one.
export const organizations = pgTable('organizations', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

// role: admin | dispatcher | technician
export const users = pgTable('users', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash'),
  role: text('role').notNull().default('dispatcher'),
  orgId: text('org_id').references(() => organizations.id, { onDelete: 'cascade' }),
  // Links a technician-role user to the crew member they represent.
  technicianId: text('technician_id').references(() => technicians.id, {
    onDelete: 'set null',
  }),
  image: text('image'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

// status: pending | accepted | revoked
export const invites = pgTable('invites', {
  id: text('id').primaryKey(),
  orgId: text('org_id')
    .notNull()
    .references(() => organizations.id, { onDelete: 'cascade' }),
  email: text('email').notNull(),
  role: text('role').notNull().default('technician'),
  token: text('token').notNull().unique(),
  status: text('status').notNull().default('pending'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const customers = pgTable('customers', {
  id: text('id').primaryKey(),
  orgId: text('org_id').references(() => organizations.id, { onDelete: 'cascade' }),
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
  orgId: text('org_id').references(() => organizations.id, { onDelete: 'cascade' }),
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
  orgId: text('org_id').references(() => organizations.id, { onDelete: 'cascade' }),
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
  orgId: text('org_id').references(() => organizations.id, { onDelete: 'cascade' }),
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

// Live chat rows. roomId is 'general' for the team channel or `job:<id>` for a
// job thread. authorName is snapshotted so history survives a member leaving.
export const messages = pgTable('messages', {
  id: text('id').primaryKey(),
  orgId: text('org_id')
    .notNull()
    .references(() => organizations.id, { onDelete: 'cascade' }),
  roomId: text('room_id').notNull(),
  authorId: text('author_id').notNull(),
  authorName: text('author_name').notNull(),
  body: text('body').notNull(),
  editedAt: timestamp('edited_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

// Last time each user opened a room, so the sidebar can show an unread count.
export const chatReads = pgTable(
  'chat_reads',
  {
    userId: text('user_id').notNull(),
    roomId: text('room_id').notNull(),
    orgId: text('org_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    lastReadAt: timestamp('last_read_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.userId, table.roomId] }),
  }),
);

export type OrganizationRow = typeof organizations.$inferSelect;
export type UserRow = typeof users.$inferSelect;
export type InviteRow = typeof invites.$inferSelect;
export type CustomerRow = typeof customers.$inferSelect;
export type TechnicianRow = typeof technicians.$inferSelect;
export type JobRow = typeof jobs.$inferSelect;
export type InvoiceRow = typeof invoices.$inferSelect;
export type InvoiceItemRow = typeof invoiceItems.$inferSelect;
export type JobEventRow = typeof jobEvents.$inferSelect;
export type MessageRow = typeof messages.$inferSelect;
export type ChatReadRow = typeof chatReads.$inferSelect;
