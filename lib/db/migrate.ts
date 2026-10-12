import { db } from './index';

// Applies the SQL migrations in ./drizzle against whichever database we're on:
// Neon (DATABASE_URL set) in production, embedded PGlite locally.
export async function runMigrations() {
  if (process.env.DATABASE_URL) {
    const { migrate } = await import('drizzle-orm/neon-http/migrator');
    await migrate(db as never, { migrationsFolder: './drizzle' });
  } else {
    const { migrate } = await import('drizzle-orm/pglite/migrator');
    await migrate(db as never, { migrationsFolder: './drizzle' });
  }
}

if (require.main === module) {
  runMigrations()
    .then(() => {
      console.log('Migrations applied.');
      process.exit(0);
    })
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}
