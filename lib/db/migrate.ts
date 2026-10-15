import { db } from './index';

export async function runMigrations() {
  if (process.env.DATABASE_URL) {
    const { migrate } = await import('drizzle-orm/postgres-js/migrator');
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
