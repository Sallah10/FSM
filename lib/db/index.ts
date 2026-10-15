import { PGlite } from '@electric-sql/pglite';
import { drizzle as drizzlePostgres } from 'drizzle-orm/postgres-js';
import { drizzle as drizzlePglite } from 'drizzle-orm/pglite';
import type { PgDatabase, PgQueryResultHKT } from 'drizzle-orm/pg-core';
import postgres from 'postgres';
import * as schema from './schema';

export type Database = PgDatabase<PgQueryResultHKT, typeof schema>;

function createDb(): Database {
  const url = process.env.DATABASE_URL;
  if (url) {
    const isLocal = /(^|@)(localhost|127\.0\.0\.1)/.test(url);
    const client = postgres(url, {
      // Transaction-mode poolers (Supabase Supavisor, Neon) can't hold prepared
      // statements between queries.
      prepare: false,
      max: 1,
      ssl: isLocal ? false : 'require',
    });
    return drizzlePostgres(client, { schema });
  }
  const client = new PGlite(process.env.PGLITE_PATH ?? './.pgdata');
  return drizzlePglite(client, { schema });
}

const globalForDb = globalThis as unknown as { __quicksetDb?: Database };

function getDb(): Database {
  if (!globalForDb.__quicksetDb) {
    globalForDb.__quicksetDb = createDb();
  }
  return globalForDb.__quicksetDb;
}

// Lazily open the connection on first query so `next build` (which imports
// route modules but never runs them) doesn't boot a database.
export const db = new Proxy({} as Database, {
  get(_target, prop) {
    const real = getDb() as unknown as Record<string | symbol, unknown>;
    const value = real[prop];
    return typeof value === 'function' ? value.bind(real) : value;
  },
});

export { schema };
