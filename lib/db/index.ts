import fs from 'node:fs';
import path from 'node:path';
import Database from 'better-sqlite3';
import { drizzle, type BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import * as schema from './schema';

const dbPath =
  process.env.DATABASE_PATH ?? path.join(process.cwd(), 'data', 'quickset.db');

function createDb(): BetterSQLite3Database<typeof schema> {
  const dir = path.dirname(dbPath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  const sqlite = new Database(dbPath);
  sqlite.pragma('journal_mode = WAL');
  sqlite.pragma('foreign_keys = ON');

  return drizzle(sqlite, { schema });
}

// Reuse the connection across hot reloads in dev so we don't leak file handles.
const globalForDb = globalThis as unknown as {
  __quicksetDb?: BetterSQLite3Database<typeof schema>;
};

export const db = globalForDb.__quicksetDb ?? createDb();

if (process.env.NODE_ENV !== 'production') {
  globalForDb.__quicksetDb = db;
}

export { schema };
