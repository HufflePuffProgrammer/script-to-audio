-- Full Supabase schema for script-to-audio.
-- Run in Supabase SQL editor (Dashboard → SQL → New query).

create table screenplays (
  id uuid primary key default gen_random_uuid(),
  title text,
  raw_text text,
  owner_id uuid references auth.users(id) on delete set null,
  scene_count int default 0,
  last_scene_parsed int,
  number_of_characters int default 0,
  stage_of_development text default 'created',
  created_at timestamptz default now()
);

create index screenplays_owner_id_idx on screenplays (owner_id);

create table scenes (
  id uuid primary key default gen_random_uuid(),
  screenplay_id uuid references screenplays(id) on delete cascade,
  scene_number int,
  heading text,
  dialogue jsonb,
  created_at timestamptz default now()
);

create table character_voices (
  id uuid primary key default gen_random_uuid(),
  screenplay_id uuid references screenplays(id) on delete cascade,
  character text not null,
  voice_id text,
  description text,
  labels jsonb,
  reason text,
  created_at timestamptz default now(),
  unique (screenplay_id, character)
);

create table audio_assets (
  id uuid primary key default gen_random_uuid(),
  screenplay_id uuid references screenplays(id) on delete cascade,
  scene_id uuid references scenes(id) on delete cascade,
  audio_url text,
  created_at timestamptz default now()
);

-- Server-side error log (written from src/lib/db/action.ts and data.ts via logDbError).
create table errors (
  id uuid primary key default gen_random_uuid(),
  source text not null,
  message text not null,
  context jsonb,
  created_at timestamptz default now()
);

create index errors_created_at_idx on errors (created_at desc);
create index errors_source_idx on errors (source);

-- Member allowlist (Supabase Auth → app access). See docs/auth-setup.md Step 2.
create table authorized_users (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null unique,
  email text not null,
  role text not null default 'user' check (role in ('administrator', 'user', 'test')),
  created_at timestamptz default now()
);

create index authorized_users_email_idx on authorized_users (email);

-- RLS (adjust for your auth model)
alter table screenplays enable row level security;
alter table scenes enable row level security;
alter table character_voices enable row level security;
alter table audio_assets enable row level security;
alter table errors enable row level security;
alter table authorized_users enable row level security;

create policy "screenplays_read_all" on screenplays for select using (true);
create policy "scenes_read_all" on scenes for select using (true);
create policy "character_voices_read_all" on character_voices for select using (true);
create policy "audio_read_all" on audio_assets for select using (true);
create policy "errors_read_service" on errors for select using (auth.role() = 'service_role');

create policy "screenplays_write_service" on screenplays
  for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
create policy "scenes_write_service" on scenes
  for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
create policy "character_voices_write_service" on character_voices
  for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
create policy "audio_write_service" on audio_assets
  for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
create policy "errors_write_service" on errors
  for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

create policy "authorized_users_read_own" on authorized_users
  for select using (auth.uid() = user_id);
create policy "authorized_users_write_service" on authorized_users
  for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
