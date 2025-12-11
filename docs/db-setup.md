# Database Setup (Supabase)

Use this to stand up Supabase Postgres for screenplay/scenes/audio persistence.

## 1) Env vars (`.env.local`)
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key   # server-only
```

## 2) Install client
```
npm install @supabase/supabase-js
```

## 3) SQL schema (run in Supabase SQL editor)
```sql
create table screenplays (
  id uuid primary key default gen_random_uuid(),
  title text,
  raw_text text,
  created_at timestamptz default now()
);

create table scenes (
  id uuid primary key default gen_random_uuid(),
  screenplay_id uuid references screenplays(id) on delete cascade,
  scene_number int,
  heading text,
  dialogue jsonb,
  created_at timestamptz default now()
);

create table audio_assets (
  id uuid primary key default gen_random_uuid(),
  scene_id uuid references scenes(id) on delete cascade,
  audio_url text,
  created_at timestamptz default now()
);
```

## 4) Clients
- Browser: create `supabaseClient` with `createClient(NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY)`.
- Server/API routes: use anon for reads; for writes/privileged ops use a separate admin client with `SUPABASE_SERVICE_ROLE_KEY` (never expose to the client).

## 5) RLS
- Enable RLS on `screenplays`, `scenes`, `audio_assets`:
```sql
alter table screenplays enable row level security;
alter table scenes enable row level security;
alter table audio_assets enable row level security;
```
- Example open-read/owner-write policies (replace with your auth model):
```sql
-- Allow anyone to read (adjust for your needs)
create policy "screenplays_read_all" on screenplays for select using (true);
create policy "scenes_read_all" on scenes for select using (true);
create policy "audio_read_all" on audio_assets for select using (true);

-- Allow service role (or future owner column) to insert/update
create policy "screenplays_write_service" on screenplays
  for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
create policy "scenes_write_service" on scenes
  for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
create policy "audio_write_service" on audio_assets
  for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
```
- If unauthenticated dev only, you can leave RLS off temporarily. For multi-user, add Supabase Auth and per-user ownership columns/policies (e.g., `owner_id uuid references auth.users(id)`).

## 6) Optional: Storage for audio files
- Create a bucket (e.g., `audio`), upload generated audio there, and store the public URL in `audio_assets.audio_url` instead of a data URL.

## 7) Integration notes
- `/api/parse`: insert screenplay + scenes after parsing.
- `/api/generate-audio`: insert/update `audio_assets` for the scene when audio is generated.
- UI: fetch scenes/audio either directly via Supabase client (read-only) or through your API routes.

