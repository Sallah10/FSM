import { desc, eq } from 'drizzle-orm';
import { randomUUID } from 'node:crypto';
import { db } from './index';
import {
  customers,
  invoices,
  invoiceItems,
  jobEvents,
  jobs,
  technicians,
  users,
} from './schema';
import type {
  Customer,
  DashboardStats,
  Invoice,
  InvoiceStatus,
  Job,
  JobEvent,
  JobPriority,
  JobStatus,
  Technician,
} from '@/lib/types';

export function newId(prefix: string) {
  return `${prefix}_${randomUUID().slice(0, 8)}`;
}

export function today() {
  return new Date().toISOString().slice(0, 10);
}

// Jobs without real coordinates land somewhere near central Lagos.
const LAGOS = { lat: 6.5244, lng: 3.3792 };
function jitter(center: number) {
  return center + (Math.random() - 0.5) * 0.08;
}

/* ------------------------------- jobs ------------------------------- */

export async function listJobs(): Promise<Job[]> {
  const rows = await db
    .select({
      id: jobs.id,
      title: jobs.title,
      description: jobs.description,
      status: jobs.status,
      priority: jobs.priority,
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
    .orderBy(desc(jobs.date));

  return rows.map((row) => ({
    ...row,
    status: row.status as JobStatus,
    priority: row.priority as JobPriority,
    customer: row.customer ?? 'Unknown customer',
  }));
}

export async function getJob(id: string): Promise<Job | undefined> {
  const rows = await db
    .select({
      id: jobs.id,
      title: jobs.title,
      description: jobs.description,
      status: jobs.status,
      priority: jobs.priority,
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
    .where(eq(jobs.id, id))
    .limit(1);

  const row = rows[0];
  if (!row) return undefined;

  return {
    ...row,
    status: row.status as JobStatus,
    priority: row.priority as JobPriority,
    customer: row.customer ?? 'Unknown customer',
  };
}

export async function createJob(input: {
  title: string;
  customerId: string;
  description?: string;
  status?: JobStatus;
  priority?: JobPriority;
  date?: string;
  technicianId?: string | null;
  lat?: number;
  lng?: number;
}): Promise<Job> {
  const id = newId('job');
  await db.insert(jobs).values({
    id,
    title: input.title,
    customerId: input.customerId,
    description: input.description ?? null,
    status: input.status ?? 'pending',
    priority: input.priority ?? 'normal',
    date: input.date ?? today(),
    technicianId: input.technicianId ?? null,
    lat: input.lat ?? jitter(LAGOS.lat),
    lng: input.lng ?? jitter(LAGOS.lng),
  });

  await createJobEvent(id, 'created', 'Job created');
  return (await getJob(id))!;
}

export async function updateJob(
  id: string,
  patch: {
    title?: string;
    description?: string | null;
    status?: JobStatus;
    priority?: JobPriority;
    date?: string;
    customerId?: string;
    technicianId?: string | null;
    lat?: number;
    lng?: number;
  },
): Promise<Job | undefined> {
  const before = await getJob(id);
  if (!before) return undefined;

  await db.update(jobs).set(patch).where(eq(jobs.id, id));

  if (patch.status && patch.status !== before.status) {
    await createJobEvent(
      id,
      'status',
      `Status changed from ${label(before.status)} to ${label(patch.status)}`,
    );
  }
  if (patch.technicianId && patch.technicianId !== before.technicianId) {
    const tech = await getTechnician(patch.technicianId);
    if (tech) await createJobEvent(id, 'assignment', `Assigned to ${tech.name}`);
  }

  return getJob(id);
}

export async function updateJobStatus(
  id: string,
  status: JobStatus,
): Promise<Job | undefined> {
  return updateJob(id, { status });
}

export async function deleteJob(id: string): Promise<void> {
  await db.delete(jobs).where(eq(jobs.id, id));
}

/* --------------------------- job activity --------------------------- */

export async function listJobEvents(jobId: string): Promise<JobEvent[]> {
  const rows = await db
    .select()
    .from(jobEvents)
    .where(eq(jobEvents.jobId, jobId))
    .orderBy(desc(jobEvents.createdAt));
  return rows.map((row) => ({
    id: row.id,
    jobId: row.jobId,
    type: row.type,
    message: row.message,
    createdAt: row.createdAt.toISOString(),
  }));
}

export async function createJobEvent(
  jobId: string,
  type: string,
  message: string,
): Promise<void> {
  await db.insert(jobEvents).values({
    id: newId('evt'),
    jobId,
    type,
    message,
  });
}

/* ----------------------------- customers ---------------------------- */

export async function listCustomers(): Promise<Customer[]> {
  return db.select().from(customers).orderBy(customers.name);
}

export async function getCustomer(id: string): Promise<Customer | undefined> {
  const rows = await db.select().from(customers).where(eq(customers.id, id)).limit(1);
  return rows[0];
}

export async function createCustomer(input: {
  name: string;
  email: string;
  phone?: string;
  address?: string;
  lat?: number;
  lng?: number;
}): Promise<Customer> {
  const id = newId('cus');
  await db.insert(customers).values({
    id,
    name: input.name,
    email: input.email,
    phone: input.phone ?? null,
    address: input.address ?? null,
    lat: input.lat ?? jitter(LAGOS.lat),
    lng: input.lng ?? jitter(LAGOS.lng),
  });

  return (await getCustomer(id))!;
}

export async function updateCustomer(
  id: string,
  patch: Partial<{
    name: string;
    email: string;
    phone: string | null;
    address: string | null;
    lat: number;
    lng: number;
  }>,
): Promise<Customer | undefined> {
  await db.update(customers).set(patch).where(eq(customers.id, id));
  return getCustomer(id);
}

export async function deleteCustomer(id: string): Promise<void> {
  await db.delete(customers).where(eq(customers.id, id));
}

/* ---------------------------- technicians --------------------------- */

export async function listTechnicians(): Promise<Technician[]> {
  return db.select().from(technicians).orderBy(technicians.name);
}

export async function getTechnician(id: string): Promise<Technician | undefined> {
  const rows = await db
    .select()
    .from(technicians)
    .where(eq(technicians.id, id))
    .limit(1);
  return rows[0];
}

export async function createTechnician(input: {
  name: string;
  email: string;
  phone?: string;
  role?: string;
  lat?: number;
  lng?: number;
}): Promise<Technician> {
  const id = newId('tech');
  await db.insert(technicians).values({
    id,
    name: input.name,
    email: input.email,
    phone: input.phone ?? null,
    role: input.role ?? 'Technician',
    lat: input.lat ?? jitter(LAGOS.lat),
    lng: input.lng ?? jitter(LAGOS.lng),
  });
  return (await getTechnician(id))!;
}

export async function updateTechnician(
  id: string,
  patch: Partial<{
    name: string;
    email: string;
    phone: string | null;
    role: string;
    lat: number;
    lng: number;
  }>,
): Promise<Technician | undefined> {
  await db.update(technicians).set(patch).where(eq(technicians.id, id));
  return getTechnician(id);
}

export async function deleteTechnician(id: string): Promise<void> {
  await db.delete(technicians).where(eq(technicians.id, id));
}

/* ------------------------------ invoices ---------------------------- */

async function itemsByInvoice() {
  const grouped = new Map<string, { name: string; price: number }[]>();
  const all = await db.select().from(invoiceItems);
  for (const item of all) {
    const list = grouped.get(item.invoiceId) ?? [];
    list.push({ name: item.name, price: item.price });
    grouped.set(item.invoiceId, list);
  }
  return grouped;
}

export async function listInvoices(): Promise<Invoice[]> {
  const [items, rows] = await Promise.all([
    itemsByInvoice(),
    db
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
      .orderBy(desc(invoices.date)),
  ]);

  return rows.map((row) => ({
    ...row,
    status: row.status as InvoiceStatus,
    customer: row.customer ?? 'Unknown customer',
    items: items.get(row.id) ?? [],
  }));
}

export async function getInvoice(id: string): Promise<Invoice | undefined> {
  const rows = await db
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
    .where(eq(invoices.id, id))
    .limit(1);

  const row = rows[0];
  if (!row) return undefined;

  const items = await db
    .select()
    .from(invoiceItems)
    .where(eq(invoiceItems.invoiceId, id));

  return {
    ...row,
    status: row.status as InvoiceStatus,
    customer: row.customer ?? 'Unknown customer',
    items: items.map((item) => ({ name: item.name, price: item.price })),
  };
}

export async function createInvoice(input: {
  customerId: string;
  date?: string;
  status?: InvoiceStatus;
  items: { name: string; price: number }[];
}): Promise<Invoice> {
  const id = newId('inv');
  const amount = input.items.reduce((sum, item) => sum + item.price, 0);

  await db.insert(invoices).values({
    id,
    customerId: input.customerId,
    amount,
    status: input.status ?? 'unpaid',
    date: input.date ?? today(),
  });

  if (input.items.length) {
    await db.insert(invoiceItems).values(
      input.items.map((item) => ({
        id: newId('itm'),
        invoiceId: id,
        name: item.name,
        price: item.price,
      })),
    );
  }

  return (await getInvoice(id))!;
}

export async function updateInvoiceStatus(
  id: string,
  status: InvoiceStatus,
): Promise<Invoice | undefined> {
  await db.update(invoices).set({ status }).where(eq(invoices.id, id));
  return getInvoice(id);
}

export async function deleteInvoice(id: string): Promise<void> {
  await db.delete(invoices).where(eq(invoices.id, id));
}

/* ------------------------------- users ------------------------------ */

export async function getUserByEmail(email: string) {
  const rows = await db
    .select()
    .from(users)
    .where(eq(users.email, email.toLowerCase()))
    .limit(1);
  return rows[0];
}

export async function getUserById(id: string) {
  const rows = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return rows[0];
}

export async function createUser(input: {
  name: string;
  email: string;
  passwordHash?: string | null;
  role?: string;
  image?: string | null;
}) {
  const id = newId('usr');
  await db.insert(users).values({
    id,
    name: input.name,
    email: input.email.toLowerCase(),
    passwordHash: input.passwordHash ?? null,
    role: input.role ?? 'dispatcher',
    image: input.image ?? null,
  });

  return (await getUserById(id))!;
}

/* ------------------------------- stats ------------------------------ */

export async function getStats(): Promise<DashboardStats> {
  const [allJobs, allInvoices, customerList, technicianList] = await Promise.all([
    listJobs(),
    listInvoices(),
    listCustomers(),
    listTechnicians(),
  ]);

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
    totalCustomers: customerList.length,
    totalTechnicians: technicianList.length,
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

function label(status: string) {
  return status.replace(/_/g, ' ');
}
