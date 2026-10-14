import { readFileSync } from 'node:fs';
import postgres from 'postgres';

const url = process.env.DATABASE_URL;
if (!url) {
  console.error('DATABASE_URL is not set. Point it at your Supabase database.');
  process.exit(1);
}

const sql = postgres(url, {
  prepare: false,
  max: 1,
  ssl: /(^|@)(localhost|127\.0\.0\.1)/.test(url) ? false : 'require',
});

async function main() {
  const statements = readFileSync('supabase/setup.sql', 'utf8');
  await sql.unsafe(statements);
  console.log('Supabase realtime + RLS setup applied.');
}

main()
  .then(() => sql.end())
  .catch(async (error) => {
    console.error(error);
    await sql.end();
    process.exit(1);
  });
