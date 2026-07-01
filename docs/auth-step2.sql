-- Step 2: member allowlist (run in Supabase SQL editor)
-- Links Supabase Auth users to app membership.
-- See docs/auth-setup.md § Step 2

create table if not exists authorized_users (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null unique,
  email text not null,
  created_at timestamptz default now()
);

create index if not exists authorized_users_email_idx on authorized_users (email);

alter table authorized_users enable row level security;

-- Logged-in users can check their own membership (used by dashboard in Step 5)
drop policy if exists "authorized_users_read_own" on authorized_users;
create policy "authorized_users_read_own" on authorized_users
  for select using (auth.uid() = user_id);

-- Only service role manages the allowlist (scripts / admin)
drop policy if exists "authorized_users_write_service" on authorized_users;
create policy "authorized_users_write_service" on authorized_users
  for all using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

-- Add your test user (replace UUID and email from Authentication → Users)
-- insert into authorized_users (user_id, email)
-- values ('00000000-0000-0000-0000-000000000000', 'dev@example.com');
