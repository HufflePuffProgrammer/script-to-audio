-- Step 7: user roles + per-user screenplays (run in Supabase SQL editor)
-- See docs/auth-setup.md § Step 7

-- Roles on the member allowlist
alter table authorized_users
  add column if not exists role text not null default 'user'
  check (role in ('administrator', 'user', 'test'));

-- Owner on screenplays (null = anonymous/demo parse)
alter table screenplays
  add column if not exists owner_id uuid references auth.users(id) on delete set null;

create index if not exists screenplays_owner_id_idx on screenplays (owner_id);

-- Promote your admin (replace email)
-- update authorized_users set role = 'administrator' where email = 'you@example.com';
