-- Run this once against your Supabase project AFTER `npm run db:migrate`.
-- It wires Realtime (live chat + live board updates) and locks each organization
-- to its own rows. Safe to re-run.

-- 1. Stream row changes from these tables to Realtime subscribers.
do $$ begin
  alter publication supabase_realtime add table public.messages;
exception when duplicate_object then null; end $$;
do $$ begin
  alter publication supabase_realtime add table public.jobs;
exception when duplicate_object then null; end $$;
do $$ begin
  alter publication supabase_realtime add table public.invoices;
exception when duplicate_object then null; end $$;

-- 2. Row Level Security. Realtime evaluates these per subscriber using the JWT
--    our /api/realtime/token route mints, which carries an `org` claim. A member
--    can only ever receive rows for their own organization. Our server talks to
--    Postgres directly as the owning role, so it bypasses RLS on writes.

alter table public.messages enable row level security;
alter table public.jobs enable row level security;
alter table public.invoices enable row level security;

grant usage on schema public to authenticated;
grant select on public.messages, public.jobs, public.invoices to authenticated;

drop policy if exists "org read messages" on public.messages;
create policy "org read messages" on public.messages
  for select to authenticated
  using (org_id = (auth.jwt() ->> 'org'));

drop policy if exists "org read jobs" on public.jobs;
create policy "org read jobs" on public.jobs
  for select to authenticated
  using (org_id = (auth.jwt() ->> 'org'));

drop policy if exists "org read invoices" on public.invoices;
create policy "org read invoices" on public.invoices
  for select to authenticated
  using (org_id = (auth.jwt() ->> 'org'));
