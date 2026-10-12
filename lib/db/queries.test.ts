import { beforeAll, describe, expect, it } from 'vitest';
import os from 'node:os';
import path from 'node:path';

// Point the app at a throwaway database before anything imports lib/db.
process.env.DATABASE_PATH = path.join(os.tmpdir(), `quickset-test-${Date.now()}.db`);

let queries: typeof import('@/lib/db/queries');

beforeAll(async () => {
  const { db } = await import('@/lib/db');
  const { migrate } = await import('drizzle-orm/better-sqlite3/migrator');
  migrate(db, { migrationsFolder: './drizzle' });

  const { customers, jobs, technicians } = await import('@/lib/db/schema');
  db.insert(customers)
    .values({ id: 'cus_1', name: 'Ada Obi', email: 'ada@example.com' })
    .run();
  db.insert(technicians)
    .values({ id: 'tec_1', name: 'Bola Ade', email: 'bola@example.com', role: 'Plumber' })
    .run();
  db.insert(jobs)
    .values({
      id: 'job_1',
      title: 'Leak repair',
      customerId: 'cus_1',
      technicianId: 'tec_1',
      status: 'completed',
      date: '2025-07-01',
    })
    .run();
  db.insert(jobs)
    .values({
      id: 'job_2',
      title: 'New tap',
      customerId: 'cus_1',
      status: 'pending',
      date: '2025-07-02',
    })
    .run();

  queries = await import('@/lib/db/queries');
});

describe('job queries', () => {
  it('lists jobs joined with customer and technician names', () => {
    const list = queries.listJobs();
    expect(list).toHaveLength(2);

    const first = list.find((job) => job.id === 'job_1')!;
    expect(first.customer).toBe('Ada Obi');
    expect(first.technician).toBe('Bola Ade');
  });

  it('updates a job status', () => {
    const updated = queries.updateJobStatus('job_2', 'completed');
    expect(updated?.status).toBe('completed');
  });

  it('returns undefined for an unknown job', () => {
    expect(queries.getJob('does-not-exist')).toBeUndefined();
  });
});

describe('stats', () => {
  it('aggregates counts from the database', () => {
    const stats = queries.getStats();
    expect(stats.totalJobs).toBe(2);
    expect(stats.completedJobs).toBe(2);
    expect(stats.totalCustomers).toBe(1);
    expect(stats.totalTechnicians).toBe(1);
  });
});
