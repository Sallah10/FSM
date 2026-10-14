import { beforeAll, describe, expect, it } from 'vitest';
import os from 'node:os';
import path from 'node:path';

// Force the embedded PGlite database for tests, even if .env.local points at a
// real Postgres. Nothing here should ever touch production data.
delete process.env.DATABASE_URL;
process.env.PGLITE_PATH = path.join(
  os.tmpdir(),
  `quickset-test-${Date.now()}-${Math.random().toString(36).slice(2)}`,
);

const ORG = 'org_test';

let queries: typeof import('@/lib/db/queries');

beforeAll(async () => {
  const { db } = await import('@/lib/db');
  const { runMigrations } = await import('@/lib/db/migrate');
  await runMigrations();

  const { customers, jobs, technicians, organizations } = await import(
    '@/lib/db/schema'
  );
  await db.insert(organizations).values({ id: ORG, name: 'Test Co' });
  await db.insert(customers).values({
    id: 'cus_1',
    orgId: ORG,
    name: 'Ada Obi',
    email: 'ada@example.com',
  });
  await db.insert(technicians).values({
    id: 'tec_1',
    orgId: ORG,
    name: 'Bola Ade',
    email: 'bola@example.com',
    role: 'Plumber',
  });
  await db.insert(jobs).values({
    id: 'job_1',
    orgId: ORG,
    title: 'Leak repair',
    customerId: 'cus_1',
    technicianId: 'tec_1',
    status: 'completed',
    priority: 'normal',
    date: '2025-07-01',
  });
  await db.insert(jobs).values({
    id: 'job_2',
    orgId: ORG,
    title: 'New tap',
    customerId: 'cus_1',
    status: 'pending',
    priority: 'high',
    date: '2025-07-02',
  });

  queries = await import('@/lib/db/queries');
});

describe('job queries', () => {
  it('lists jobs joined with customer and technician names', async () => {
    const list = await queries.listJobs(ORG);
    expect(list).toHaveLength(2);

    const first = list.find((job) => job.id === 'job_1')!;
    expect(first.customer).toBe('Ada Obi');
    expect(first.technician).toBe('Bola Ade');
  });

  it('does not leak jobs from other organizations', async () => {
    expect(await queries.listJobs('org_other')).toHaveLength(0);
  });

  it('updates a job status', async () => {
    const updated = await queries.updateJobStatus(ORG, 'job_2', 'completed');
    expect(updated?.status).toBe('completed');
  });

  it('returns undefined for an unknown job', async () => {
    expect(await queries.getJob(ORG, 'does-not-exist')).toBeUndefined();
  });
});

describe('messages', () => {
  it('stores a message and returns it oldest-first', async () => {
    const created = await queries.createMessage(
      ORG,
      { id: 'usr_1', name: 'Ada Obi' },
      { roomId: 'general', body: 'Hello team' },
    );
    expect(created.body).toBe('Hello team');
    expect(created.authorName).toBe('Ada Obi');

    const list = await queries.listMessages(ORG, 'general');
    expect(list.map((message) => message.id)).toContain(created.id);
  });

  it('keeps rooms and organizations separate', async () => {
    await queries.createMessage(
      ORG,
      { id: 'usr_1', name: 'Ada Obi' },
      { roomId: 'job:job_1', body: 'Ordered the part' },
    );

    const general = await queries.listMessages(ORG, 'general');
    expect(general.every((message) => message.roomId === 'general')).toBe(true);
    expect(await queries.listMessages('org_other', 'general')).toHaveLength(0);
  });
});

describe('stats', () => {
  it('aggregates counts from the database', async () => {
    const stats = await queries.getStats(ORG);
    expect(stats.totalJobs).toBe(2);
    expect(stats.completedJobs).toBe(2);
    expect(stats.totalCustomers).toBe(1);
    expect(stats.totalTechnicians).toBe(1);
  });
});
