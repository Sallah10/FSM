import { neon } from '@neondatabase/serverless';
import { PGlite } from '@electric-sql/pglite';
import { drizzle as drizzleNeon } from 'drizzle-orm/neon-http';
import { drizzle as drizzlePglite } from 'drizzle-orm/pglite';
import type { PgDatabase, PgQueryResultHKT } from 'drizzle-orm/pg-core';
import * as schema from './schema';

export type Database = PgDatabase<PgQueryResultHKT, typeof schema>;

// On Vercel we talk to Neon over HTTP. Locally (and in tests) we run an embedded
// Postgres (PGlite) so there's nothing to install. Same schema, same queries.
function createDb(): Database {
  if (process.env.DATABASE_URL) {
    return drizzleNeon(neon(process.env.DATABASE_URL), { schema });
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

// Lazily open the connection on first query. This keeps `next build` (which
// imports route modules but never runs them) from booting PGlite/Neon early.
export const db = new Proxy({} as Database, {
  get(_target, prop) {
    const real = getDb() as unknown as Record<string | symbol, unknown>;
    const value = real[prop];
    return typeof value === 'function' ? value.bind(real) : value;
  },
});

export { schema };
