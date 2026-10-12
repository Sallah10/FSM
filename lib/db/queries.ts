import { desc, eq } from 'drizzle-orm';
import { randomUUID } from 'node:crypto';
import { db } from './index';
import {
  customers,
  invoices,
  invoiceItems,
  jobs,
  technicians,
  users,
} from './schema';
import type {
  Customer,
  DashboardStats,
  Invoice,
  Job,
  JobStatus,
  Technician,
} from '@/lib/types';

export function newId(prefix: string) {
  return `${prefix}_${randomUUID().slice(0, 8)}`;
}

// Jobs a job site lands near central Lagos when nobody picked real coordinates.
const LAGOS = { lat: 6.5244, lng: 3.3792 };
function jitter(center: number) {
  return center + (Math.random() - 0.5) * 0.08;
}

/* ------------------------------- jobs ------------------------------- */

export function listJobs(): Job[] {
  const rows = db
    .select({
      id: jobs.id,
      title: jobs.title,
      description: jobs.description,
      status: jobs.status,
      date: jobs.date,
      customerId: jobs.customerId,
      technicianId: jobs.technicianId,
      lat: jobs.lat,
      lng: jobs.lng,
      customer: customers.name,
      technician: technicians.name,
    })
    .from(jobs)
    .leftJoin(customers, eq(jobs.customerId, customers.id))
    .leftJoin(technicians, eq(jobs.technicianId, technicians.id))
    .orderBy(desc(jobs.date))
    .all();

  return rows.map((row) => ({
    ...row,
    status: row.status as JobStatus,
    customer: row.customer ?? 'Unknown customer',
  }));
}

export function getJob(id: string): Job | undefined {
  return listJobs().find((job) => job.id === id);
}

export function createJob(input: {
  title: string;
  customerId: string;
  description?: string;
  status?: JobStatus;
  date?: string;
  technicianId?: string;
  lat?: number;
  lng?: number;
}): Job {
  const id = newId('job');
  db.insert(jobs)
    .values({
      id,
      title: input.title,
      customerId: input.customerId,
      description: input.description ?? null,
      status: input.status ?? 'pending',
      date: input.date ?? new Date().toISOString().slice(0, 10),
      technicianId: input.technicianId ?? null,
      lat: input.lat ?? jitter(LAGOS.lat),
      lng: input.lng ?? jitter(LAGOS.lng),
    })
    .run();

  return getJob(id)!;
}

export function updateJobStatus(id: string, status: JobStatus): Job | undefined {
  db.update(jobs).set({ status }).where(eq(jobs.id, id)).run();
  return getJob(id);
}

/* ----------------------------- customers ---------------------------- */

export function listCustomers(): Customer[] {
  return db.select().from(customers).orderBy(customers.name).all();
}

export function getCustomer(id: string): Customer | undefined {
  return db.select().from(customers).where(eq(customers.id, id)).get();
}

export function createCustomer(input: {
  name: string;
  email: string;
  phone?: string;
  address?: string;
  lat?: number;
  lng?: number;
}): Customer {
  const id = newId('cus');
  db.insert(customers)
    .values({
      id,
      name: input.name,
      email: input.email,
      phone: input.phone ?? null,
      address: input.address ?? null,
      lat: input.lat ?? jitter(LAGOS.lat),
      lng: input.lng ?? jitter(LAGOS.lng),
    })
    .run();

  return getCustomer(id)!;
}

/* ---------------------------- technicians --------------------------- */

export function listTechnicians(): Technician[] {
  return db.select().from(technicians).orderBy(technicians.name).all();
}

/* ------------------------------ invoices ---------------------------- */

function itemsByInvoice() {
  const grouped = new Map<string, { name: string; price: number }[]>();
  for (const item of db.select().from(invoiceItems).all()) {
    const list = grouped.get(item.invoiceId) ?? [];
    list.push({ name: item.name, price: item.price });
    grouped.set(item.invoiceId, list);
  }
  return grouped;
}

export function listInvoices(): Invoice[] {
  const items = itemsByInvoice();
  const rows = db
    .select({
      id: invoices.id,
      customerId: invoices.customerId,
      amount: invoices.amount,
      status: invoices.status,
      date: invoices.date,
      customer: customers.name,
    })
    .from(invoices)
    .leftJoin(customers, eq(invoices.customerId, customers.id))
    .orderBy(desc(invoices.date))
    .all();

  return rows.map((row) => ({
    ...row,
    status: row.status as Invoice['status'],
    customer: row.customer ?? 'Unknown customer',
    items: items.get(row.id) ?? [],
  }));
}

export function getInvoice(id: string): Invoice | undefined {
  return listInvoices().find((invoice) => invoice.id === id);
}

/* ------------------------------- users ------------------------------ */

export function getUserByEmail(email: string) {
  return db.select().from(users).where(eq(users.email, email.toLowerCase())).get();
}

export function getUserById(id: string) {
  return db.select().from(users).where(eq(users.id, id)).get();
}

export function createUser(input: {
  name: string;
  email: string;
  passwordHash?: string | null;
  role?: string;
  image?: string | null;
}) {
  const id = newId('usr');
  db.insert(users)
    .values({
      id,
      name: input.name,
      email: input.email.toLowerCase(),
      passwordHash: input.passwordHash ?? null,
      role: input.role ?? 'dispatcher',
      image: input.image ?? null,
    })
    .run();

  return getUserById(id)!;
}

/* ------------------------------- stats ------------------------------ */

export function getStats(): DashboardStats {
  const allJobs = listJobs();
  const allInvoices = listInvoices();

  const countBy = (status: JobStatus) =>
    allJobs.filter((job) => job.status === status).length;

  const revenueByMonthMap = new Map<string, number>();
  for (const invoice of allInvoices) {
    if (!invoice.date) continue;
    const month = invoice.date.slice(0, 7); // YYYY-MM
    revenueByMonthMap.set(
      month,
      (revenueByMonthMap.get(month) ?? 0) + invoice.amount,
    );
  }

  const jobsPerTechnicianMap = new Map<string, number>();
  for (const job of allJobs) {
    if (!job.technician) continue;
    jobsPerTechnicianMap.set(
      job.technician,
      (jobsPerTechnicianMap.get(job.technician) ?? 0) + 1,
    );
  }

  const round = (n: number) => Math.round(n * 100) / 100;

  return {
    totalJobs: allJobs.length,
    completedJobs: countBy('completed'),
    pendingJobs: countBy('pending') + countBy('in_progress'),
    cancelledJobs: countBy('cancelled'),
    totalCustomers: listCustomers().length,
    totalTechnicians: listTechnicians().length,
    paidRevenue: round(
      allInvoices
        .filter((invoice) => invoice.status === 'paid')
        .reduce((sum, invoice) => sum + invoice.amount, 0),
    ),
    outstandingRevenue: round(
      allInvoices
        .filter((invoice) => invoice.status !== 'paid')
        .reduce((sum, invoice) => sum + invoice.amount, 0),
    ),
    revenueByMonth: [...revenueByMonthMap.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, revenue]) => ({ month, revenue })),
    jobsByStatus: [
      { name: 'Completed', value: countBy('completed') },
      { name: 'Pending', value: countBy('pending') + countBy('in_progress') },
      { name: 'Cancelled', value: countBy('cancelled') },
    ],
    jobsPerTechnician: [...jobsPerTechnicianMap.entries()].map(
      ([name, jobs]) => ({ name, jobs }),
    ),
  };
}
