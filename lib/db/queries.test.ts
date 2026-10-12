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

let queries: typeof import('@/lib/db/queries');

beforeAll(async () => {
  const { db } = await import('@/lib/db');
  const { runMigrations } = await import('@/lib/db/migrate');
  await runMigrations();

  const { customers, jobs, technicians } = await import('@/lib/db/schema');
  await db
    .insert(customers)
    .values({ id: 'cus_1', name: 'Ada Obi', email: 'ada@example.com' });
  await db.insert(technicians).values({
    id: 'tec_1',
    name: 'Bola Ade',
    email: 'bola@example.com',
    role: 'Plumber',
  });
  await db.insert(jobs).values({
    id: 'job_1',
    title: 'Leak repair',
    customerId: 'cus_1',
    technicianId: 'tec_1',
    status: 'completed',
    priority: 'normal',
    date: '2025-07-01',
  });
  await db.insert(jobs).values({
    id: 'job_2',
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
    const list = await queries.listJobs();
    expect(list).toHaveLength(2);

    const first = list.find((job) => job.id === 'job_1')!;
    expect(first.customer).toBe('Ada Obi');
    expect(first.technician).toBe('Bola Ade');
  });

  it('updates a job status', async () => {
    const updated = await queries.updateJobStatus('job_2', 'completed');
    expect(updated?.status).toBe('completed');
  });

  it('returns undefined for an unknown job', async () => {
    expect(await queries.getJob('does-not-exist')).toBeUndefined();
  });
});

describe('stats', () => {
  it('aggregates counts from the database', async () => {
    const stats = await queries.getStats();
    expect(stats.totalJobs).toBe(2);
    expect(stats.completedJobs).toBe(2);
    expect(stats.totalCustomers).toBe(1);
    expect(stats.totalTechnicians).toBe(1);
  });
});
