# Script-to-Audio

MVP workspace for converting screenplay text into structured scenes and staging multi-voice audio generation with ElevenLabs Agents. Stack: Next.js (App Router, TS), Tailwind v4, Supabase, ElevenLabs Agents.

## Auth (member login)

Step 1 (Supabase Dashboard + env): see [`docs/auth-setup.md`](docs/auth-setup.md). After configuring, run:

```bash
npm run check:auth-env
```

## Quick start

```bash
cd script-to-audio
npm run dev
```

Visit http://localhost:3000 and paste ~800-1000 words of screenplay text to see the mock parser and profiling guardrails.

### Database
- See `docs/db-setup.md` for Supabase env vars, schema (`docs/schema.sql`), and integration notes.
- DB helpers log failures to the `errors` table via `src/lib/db/logError.ts` (service role required).

### Auth
- Step 1: `docs/auth-setup.md` — enable Supabase Email auth, redirect URLs, test user, env vars. Verify with `npm run check:auth-env`.
- Step 2: run `docs/auth-step2.sql`, add member with `npm run auth:add-member -- email`, verify with `npm run check:auth-step2`.
- Step 3: `@supabase/ssr` + middleware protect `/dashboard` and `/admin`. Verify with `npm run check:auth-step3`.
- Step 4: sign in at `/login`. Verify with `npm run check:auth-step4`.
- Step 5: membership gate on `/dashboard` and `/admin`. Verify with `npm run check:auth-step5`.
- Step 6: `/api/admin/*` requires member session. Verify with `npm run check:auth-step6`.

### Debug helpers
- UI: http://localhost:3000/steps/debug — runs a sample request to `/api/generate-audio` and plays the returned audio.
- Admin: http://localhost:3000/admin — utilities hub; `/admin/screenplay-stats` lists `screenplays` progress columns.
- CLI smoke: `npm run smoke:generate` (dev server + `ELEVENLABS_API_KEY` required; override host with `SMOKE_URL`).
- Local connectivity: `npm run debug:elevenlabs` to hit ElevenLabs directly from a script.
- Admin smoke: `npm run smoke:admin` (expects **401** without session — confirms routes are protected; override host with `SMOKE_URL`).

## What’s implemented now
- Project scaffold with Tailwind v4 and App Router.
- Mock screenplay parser in `src/app/page.tsx` that:
  - Extracts scenes via headings (INT./EXT.) and uppercase character lines.
  - Tags narrator lines when no speaker is set.
  - Displays scene list and dialogue breakdown.
- Profiling controls: `profilingSceneLimit` selector with defaults baked into `src/lib/constants.ts`.
- Audio staging panel with stubbed generation status (replace with real API calls).

## Key files
- `src/app/page.tsx` — UI, mock parsing, and audio generation stub.
- `src/lib/types.ts` — Screenplay, scene, and dialogue typings.
- `src/lib/constants.ts` — App name, narrator label, and profiling defaults.
- `src/lib/sampleData.ts` — Seed text for local testing.

## Next implementation steps
- Add Supabase client + storage buckets for PDFs, parsed JSON, and audio.
- API routes:
  - `POST /api/upload` → store PDF/text, return screenplay_id.
  - `POST /api/parse` → run LLM/PDF parsing, persist scenes/characters/dialogue.
  - `POST /api/generate-audio` → call ElevenLabs Agents per scene, save audio URL.
- Honor profiling rules:
  - Use only the first N scenes per character (`profilingSceneLimit`).
  - Narrator profile from headings, descriptions, and parentheticals only.
- Playback UI that streams stored audio from Supabase.

## Profiling rules (from PDD)
- Character agents are profiled only from their first N scenes (default 1).
- Narrator is profiled from scene headings, description blocks, and parentheticals; random adult M/F selection.
- System should not read the entire screenplay for profiling—keep compute small.
