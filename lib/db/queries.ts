import { and, desc, eq } from 'drizzle-orm';
import { randomUUID } from 'node:crypto';
import { db } from './index';
import {
  customers,
  invites,
  invoices,
  invoiceItems,
  jobEvents,
  jobs,
  messages,
  organizations,
  technicians,
  users,
} from './schema';
import type {
  Customer,
  DashboardStats,
  Invite,
  Invoice,
  InvoiceStatus,
  Job,
  JobEvent,
  JobPriority,
  JobStatus,
  Message,
  OrgMember,
  Organization,
  Technician,
  UserRole,
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

export async function listJobs(orgId: string): Promise<Job[]> {
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
    .where(eq(jobs.orgId, orgId))
    .orderBy(desc(jobs.date));

  return rows.map((row) => ({
    ...row,
    status: row.status as JobStatus,
    priority: row.priority as JobPriority,
    customer: row.customer ?? 'Unknown customer',
  }));
}

export async function getJob(orgId: string, id: string): Promise<Job | undefined> {
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
    .where(and(eq(jobs.id, id), eq(jobs.orgId, orgId)))
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

export async function createJob(
  orgId: string,
  input: {
    title: string;
    customerId: string;
    description?: string;
    status?: JobStatus;
    priority?: JobPriority;
    date?: string;
    technicianId?: string | null;
    lat?: number;
    lng?: number;
  },
): Promise<Job> {
  const id = newId('job');
  await db.insert(jobs).values({
    id,
    orgId,
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
  return (await getJob(orgId, id))!;
}

export async function updateJob(
  orgId: string,
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
  const before = await getJob(orgId, id);
  if (!before) return undefined;

  await db
    .update(jobs)
    .set(patch)
    .where(and(eq(jobs.id, id), eq(jobs.orgId, orgId)));

  if (patch.status && patch.status !== before.status) {
    await createJobEvent(
      id,
      'status',
      `Status changed from ${label(before.status)} to ${label(patch.status)}`,
    );
  }
  if (patch.technicianId && patch.technicianId !== before.technicianId) {
    const tech = await getTechnician(orgId, patch.technicianId);
    if (tech) await createJobEvent(id, 'assignment', `Assigned to ${tech.name}`);
  }

  return getJob(orgId, id);
}

export async function updateJobStatus(
  orgId: string,
  id: string,
  status: JobStatus,
): Promise<Job | undefined> {
  return updateJob(orgId, id, { status });
}

export async function deleteJob(orgId: string, id: string): Promise<void> {
  await db.delete(jobs).where(and(eq(jobs.id, id), eq(jobs.orgId, orgId)));
}

/* --------------------------- job activity --------------------------- */

export async function listJobEvents(
  orgId: string,
  jobId: string,
): Promise<JobEvent[]> {
  const job = await getJob(orgId, jobId);
  if (!job) return [];

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

export async function listCustomers(orgId: string): Promise<Customer[]> {
  return db
    .select()
    .from(customers)
    .where(eq(customers.orgId, orgId))
    .orderBy(customers.name);
}

export async function getCustomer(
  orgId: string,
  id: string,
): Promise<Customer | undefined> {
  const rows = await db
    .select()
    .from(customers)
    .where(and(eq(customers.id, id), eq(customers.orgId, orgId)))
    .limit(1);
  return rows[0];
}

export async function createCustomer(
  orgId: string,
  input: {
    name: string;
    email: string;
    phone?: string;
    address?: string;
    lat?: number;
    lng?: number;
  },
): Promise<Customer> {
  const id = newId('cus');
  await db.insert(customers).values({
    id,
    orgId,
    name: input.name,
    email: input.email,
    phone: input.phone ?? null,
    address: input.address ?? null,
    lat: input.lat ?? jitter(LAGOS.lat),
    lng: input.lng ?? jitter(LAGOS.lng),
  });

  return (await getCustomer(orgId, id))!;
}

export async function updateCustomer(
  orgId: string,
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
  await db
    .update(customers)
    .set(patch)
    .where(and(eq(customers.id, id), eq(customers.orgId, orgId)));
  return getCustomer(orgId, id);
}

export async function deleteCustomer(orgId: string, id: string): Promise<void> {
  await db
    .delete(customers)
    .where(and(eq(customers.id, id), eq(customers.orgId, orgId)));
}

/* ---------------------------- technicians --------------------------- */

export async function listTechnicians(orgId: string): Promise<Technician[]> {
  return db
    .select()
    .from(technicians)
    .where(eq(technicians.orgId, orgId))
    .orderBy(technicians.name);
}

export async function getTechnician(
  orgId: string,
  id: string,
): Promise<Technician | undefined> {
  const rows = await db
    .select()
    .from(technicians)
    .where(and(eq(technicians.id, id), eq(technicians.orgId, orgId)))
    .limit(1);
  return rows[0];
}

export async function createTechnician(
  orgId: string,
  input: {
    name: string;
    email: string;
    phone?: string;
    role?: string;
    lat?: number;
    lng?: number;
  },
): Promise<Technician> {
  const id = newId('tech');
  await db.insert(technicians).values({
    id,
    orgId,
    name: input.name,
    email: input.email,
    phone: input.phone ?? null,
    role: input.role ?? 'Technician',
    lat: input.lat ?? jitter(LAGOS.lat),
    lng: input.lng ?? jitter(LAGOS.lng),
  });
  return (await getTechnician(orgId, id))!;
}

export async function updateTechnician(
  orgId: string,
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
  await db
    .update(technicians)
    .set(patch)
    .where(and(eq(technicians.id, id), eq(technicians.orgId, orgId)));
  return getTechnician(orgId, id);
}

export async function deleteTechnician(orgId: string, id: string): Promise<void> {
  await db
    .delete(technicians)
    .where(and(eq(technicians.id, id), eq(technicians.orgId, orgId)));
}

/* ------------------------------ invoices ---------------------------- */

async function itemsByInvoice(orgId: string) {
  const grouped = new Map<string, { name: string; price: number }[]>();
  const all = await db
    .select({
      invoiceId: invoiceItems.invoiceId,
      name: invoiceItems.name,
      price: invoiceItems.price,
    })
    .from(invoiceItems)
    .innerJoin(invoices, eq(invoiceItems.invoiceId, invoices.id))
    .where(eq(invoices.orgId, orgId));
  for (const item of all) {
    const list = grouped.get(item.invoiceId) ?? [];
    list.push({ name: item.name, price: item.price });
    grouped.set(item.invoiceId, list);
  }
  return grouped;
}

export async function listInvoices(orgId: string): Promise<Invoice[]> {
  const [items, rows] = await Promise.all([
    itemsByInvoice(orgId),
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
      .where(eq(invoices.orgId, orgId))
      .orderBy(desc(invoices.date)),
  ]);

  return rows.map((row) => ({
    ...row,
    status: row.status as InvoiceStatus,
    customer: row.customer ?? 'Unknown customer',
    items: items.get(row.id) ?? [],
  }));
}

export async function getInvoice(
  orgId: string,
  id: string,
): Promise<Invoice | undefined> {
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
    .where(and(eq(invoices.id, id), eq(invoices.orgId, orgId)))
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

export async function createInvoice(
  orgId: string,
  input: {
    customerId: string;
    date?: string;
    status?: InvoiceStatus;
    items: { name: string; price: number }[];
  },
): Promise<Invoice> {
  const id = newId('inv');
  const amount = input.items.reduce((sum, item) => sum + item.price, 0);

  await db.insert(invoices).values({
    id,
    orgId,
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

  return (await getInvoice(orgId, id))!;
}

export async function updateInvoiceStatus(
  orgId: string,
  id: string,
  status: InvoiceStatus,
): Promise<Invoice | undefined> {
  await db
    .update(invoices)
    .set({ status })
    .where(and(eq(invoices.id, id), eq(invoices.orgId, orgId)));
  return getInvoice(orgId, id);
}

export async function deleteInvoice(orgId: string, id: string): Promise<void> {
  await db
    .delete(invoices)
    .where(and(eq(invoices.id, id), eq(invoices.orgId, orgId)));
}

/* --------------------------- organizations -------------------------- */

export async function createOrganization(name: string): Promise<Organization> {
  const id = newId('org');
  await db.insert(organizations).values({ id, name });
  return { id, name };
}

export async function getOrganization(
  id: string,
): Promise<Organization | undefined> {
  const rows = await db
    .select()
    .from(organizations)
    .where(eq(organizations.id, id))
    .limit(1);
  const row = rows[0];
  if (!row) return undefined;
  return { id: row.id, name: row.name, createdAt: row.createdAt.toISOString() };
}

export async function renameOrganization(
  id: string,
  name: string,
): Promise<void> {
  await db.update(organizations).set({ name }).where(eq(organizations.id, id));
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
  role?: UserRole;
  orgId?: string | null;
  image?: string | null;
}) {
  const id = newId('usr');
  await db.insert(users).values({
    id,
    name: input.name,
    email: input.email.toLowerCase(),
    passwordHash: input.passwordHash ?? null,
    role: input.role ?? 'dispatcher',
    orgId: input.orgId ?? null,
    image: input.image ?? null,
  });

  return (await getUserById(id))!;
}

export async function listMembers(orgId: string): Promise<OrgMember[]> {
  const rows = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
    })
    .from(users)
    .where(eq(users.orgId, orgId))
    .orderBy(users.name);
  return rows.map((row) => ({ ...row, role: row.role as UserRole }));
}

export async function updateMemberRole(
  orgId: string,
  userId: string,
  role: UserRole,
): Promise<void> {
  await db
    .update(users)
    .set({ role })
    .where(and(eq(users.id, userId), eq(users.orgId, orgId)));
}

export async function removeMember(orgId: string, userId: string): Promise<void> {
  await db
    .delete(users)
    .where(and(eq(users.id, userId), eq(users.orgId, orgId)));
}

/* ------------------------------- invites ---------------------------- */

function toInvite(row: typeof invites.$inferSelect): Invite {
  return {
    id: row.id,
    orgId: row.orgId,
    email: row.email,
    role: row.role as UserRole,
    token: row.token,
    status: row.status as Invite['status'],
    createdAt: row.createdAt.toISOString(),
  };
}

export async function createInvite(
  orgId: string,
  email: string,
  role: UserRole,
): Promise<Invite> {
  const id = newId('invite');
  const token = randomUUID().replace(/-/g, '');
  await db.insert(invites).values({
    id,
    orgId,
    email: email.toLowerCase(),
    role,
    token,
    status: 'pending',
  });
  const rows = await db.select().from(invites).where(eq(invites.id, id)).limit(1);
  return toInvite(rows[0]);
}

export async function listInvites(orgId: string): Promise<Invite[]> {
  const rows = await db
    .select()
    .from(invites)
    .where(and(eq(invites.orgId, orgId), eq(invites.status, 'pending')))
    .orderBy(desc(invites.createdAt));
  return rows.map(toInvite);
}

export async function getInviteByToken(token: string): Promise<Invite | undefined> {
  const rows = await db
    .select()
    .from(invites)
    .where(eq(invites.token, token))
    .limit(1);
  return rows[0] ? toInvite(rows[0]) : undefined;
}

export async function markInviteAccepted(id: string): Promise<void> {
  await db.update(invites).set({ status: 'accepted' }).where(eq(invites.id, id));
}

export async function revokeInvite(orgId: string, id: string): Promise<void> {
  await db
    .update(invites)
    .set({ status: 'revoked' })
    .where(and(eq(invites.id, id), eq(invites.orgId, orgId)));
}

/* ------------------------------ messages ---------------------------- */

function toMessage(row: typeof messages.$inferSelect): Message {
  return {
    id: row.id,
    roomId: row.roomId,
    authorId: row.authorId,
    authorName: row.authorName,
    body: row.body,
    createdAt: row.createdAt.toISOString(),
  };
}

// Most recent `limit` messages for a room, returned oldest-first for display.
export async function listMessages(
  orgId: string,
  roomId: string,
  limit = 100,
): Promise<Message[]> {
  const rows = await db
    .select()
    .from(messages)
    .where(and(eq(messages.orgId, orgId), eq(messages.roomId, roomId)))
    .orderBy(desc(messages.createdAt))
    .limit(limit);
  return rows.reverse().map(toMessage);
}

export async function createMessage(
  orgId: string,
  author: { id: string; name: string },
  input: { roomId: string; body: string },
): Promise<Message> {
  const id = newId('msg');
  await db.insert(messages).values({
    id,
    orgId,
    roomId: input.roomId,
    authorId: author.id,
    authorName: author.name,
    body: input.body,
  });
  const rows = await db
    .select()
    .from(messages)
    .where(eq(messages.id, id))
    .limit(1);
  return toMessage(rows[0]);
}

/* ------------------------------- stats ------------------------------ */

export async function getStats(orgId: string): Promise<DashboardStats> {  const [allJobs, allInvoices, customerList, technicianList] = await Promise.all([
    listJobs(orgId),
    listInvoices(orgId),
    listCustomers(orgId),
    listTechnicians(orgId),
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
