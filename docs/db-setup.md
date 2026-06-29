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

**Full script:** paste and run [`docs/schema.sql`](./schema.sql) in one go.

Or apply the pieces below. At minimum you need `screenplays`, `scenes`, `character_voices`, `audio_assets`, and **`errors`** (server-side failure log).

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

-- Server-side error log (see src/lib/db/logError.ts)
create table errors (
  id uuid primary key default gen_random_uuid(),
  source text not null,
  message text not null,
  context jsonb,
  created_at timestamptz default now()
);

create index errors_created_at_idx on errors (created_at desc);
create index errors_source_idx on errors (source);
```

**Existing project — add only `errors`:**

```sql
create table if not exists errors (
  id uuid primary key default gen_random_uuid(),
  source text not null,
  message text not null,
  context jsonb,
  created_at timestamptz default now()
);
create index if not exists errors_created_at_idx on errors (created_at desc);
create index if not exists errors_source_idx on errors (source);
alter table errors enable row level security;
create policy "errors_read_service" on errors for select using (auth.role() = 'service_role');
create policy "errors_write_service" on errors
  for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
```

**Scene ID type (optional):** If you use app-level scene keys (e.g. `"2"`) instead of `scenes.id` uuids:

```sql
alter table audio_assets drop constraint if exists audio_assets_scene_id_fkey;
alter table audio_assets alter column scene_id type text using scene_id::text;
```

## 4) Clients
- Browser: create `supabaseClient` with `createClient(NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY)`.
- Server/API routes: use anon for reads; for writes/privileged ops use a separate admin client with `SUPABASE_SERVICE_ROLE_KEY` (never expose to the client).

## 5) RLS
- Enable RLS on `screenplays`, `scenes`, `character_voices`, `audio_assets`, and `errors`:
```sql
alter table screenplays enable row level security;
alter table scenes enable row level security;
alter table character_voices enable row level security;
alter table audio_assets enable row level security;
alter table errors enable row level security;
```
- Example open-read/owner-write policies (replace with your auth model):
```sql
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
```
- If unauthenticated dev only, you can leave RLS off temporarily. For multi-user, add Supabase Auth and per-user ownership columns/policies (e.g., `owner_id uuid references auth.users(id)`).

## 6) Storage for audio files (required for hosted MP3 URLs)
The app uploads to **`audio`** by default (`SUPABASE_AUDIO_BUCKET` overrides the name). If you see **`Bucket not found`**, the bucket does not exist yet.

1. Supabase Dashboard → **Storage** → **New bucket**.
2. Name: **`audio`** (or another name — then set `SUPABASE_AUDIO_BUCKET` in `.env.local` to match).
3. **Playback:** The API prefers **`createSignedUrl`** so **private** buckets still work in `<audio src="…">`. Optional: `SUPABASE_AUDIO_SIGNED_URL_EXPIRY_SEC` (default ~7 days). For permanent links without expiry, use a **public** bucket or sign URLs when serving.
4. Optional env: `SUPABASE_AUDIO_BUCKET=audio`

Without a bucket, generation still succeeds: the API falls back to a **base64 data URL** for `audio_url`.

## 7) Integration notes
- `/api/parse`: insert screenplay + scenes after parsing (`insertScreenplayAction`, `insertSceneAction`).
- `/api/generate-audio`: insert/update `audio_assets` for the scene when audio is generated.
- Character builder admin: upsert `character_voices` via `upsertVoiceIdToCharacterAction`.
- UI: fetch scenes/audio either directly via Supabase client (read-only) or through your API routes.

## 8) Error logging

Database helpers in `src/lib/db/action.ts` and `src/lib/db/data.ts` call `logDbError` (`src/lib/db/logError.ts`) when a Supabase operation fails. Each row stores:

| Column     | Description |
|------------|-------------|
| `source`   | Function name, e.g. `insertSceneAction` |
| `message`  | Supabase/Postgres error message |
| `context`  | JSON payload (screenplay id, character, counts, `code`, etc.) |
| `created_at` | Insert timestamp |

**Sources that write to `errors` today:**

- `insertScreenplayAction` — screenplay insert failed
- `insertSceneAction` — scene batch insert failed
- `upsertVoiceIdToCharacterAction` — character voice upsert failed
- `verifyVoiceIdExists` — query error (not “voice missing”; that is normal)
- `getScreenplayData` — screenplay fetch failed

Inspect recent failures in Supabase **Table Editor → errors**, or query:

```sql
select created_at, source, message, context
from errors
order by created_at desc
limit 50;
```

`/api/admin/db-check` probes connectivity to `screenplays` and `errors`. View recent rows at `/admin/error-page` (backed by `GET /api/admin/errors`).
