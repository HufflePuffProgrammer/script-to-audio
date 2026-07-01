# Auth Setup (Supabase) — Step 1

Member login uses **Supabase Auth**. Step 1 is all configuration in the Supabase Dashboard plus env vars in this repo. No app code yet.

**Progress**

| Step | What | Status |
|------|------|--------|
| 1 | Enable Supabase Auth + test user + env vars | Done |
| 2 | `authorized_users` membership table | Done |
| 3 | `@supabase/ssr` clients + middleware | Done |
| 4 | `/login` page | Done |
| 5 | `/dashboard` + membership check | Done |
| 6 | Protect `/api/admin/*` routes | Done |
| 7 | Roles + per-user screenplays + role dashboards | **Done** |

---

## 1.1 Open your Supabase project

1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard).
2. Open the project you use for script-to-audio (same one as `docs/db-setup.md`).

---

## 1.2 Enable Email auth

1. **Authentication** → **Providers**.
2. Open **Email**.
3. Turn **Enable Email provider** on.
4. For local dev, recommended settings:
   - **Confirm email:** OFF (so you can log in immediately with a test user).
   - **Secure email change:** optional for now.
5. Save.

You can switch to magic links or require email confirmation in production later.

---

## 1.3 Set redirect URLs

1. **Authentication** → **URL Configuration**.
2. Set **Site URL** (dev):

   ```
   http://localhost:3000
   ```

3. Under **Redirect URLs**, add (one per line):

   ```
   http://localhost:3000/**
   http://localhost:3000/login
   http://localhost:3000/dashboard
   ```

4. When you deploy, add your production host the same way, e.g. `https://your-app.vercel.app/**`.

These URLs must match where Next.js runs or password login / OAuth redirects will fail.

---

## 1.4 Create a test user

1. **Authentication** → **Users**.
2. **Add user** → **Create new user**.
3. Enter email + password (e.g. `dev@example.com` — use a real inbox if you turn on email confirmation).
4. Save.
5. Copy the user’s **UUID** from the users list — you’ll need it in Step 2 for `authorized_users`.

---

## 1.5 Env vars in this repo

Copy the example file and fill in values from **Project Settings** → **API**:

```bash
cp .env.example .env.local
```

Required for auth (Step 1):

| Variable | Where to find it |
|----------|------------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `anon` `public` key |
| `SUPABASE_SERVICE_ROLE_KEY` | `service_role` key (server only — never commit) |

`.env.local` is gitignored. Do not commit real keys.

---

## 1.6 Verify Step 1

From the project root:

```bash
npm run check:auth-env
```

You should see:

- All three Supabase env vars present.
- A successful connection to Supabase Auth (`Auth API reachable`).

If anything fails, fix env vars or Supabase URL settings and run again.

---

## Step 1 checklist

- [ ] Email provider enabled in Supabase
- [ ] Site URL = `http://localhost:3000`
- [ ] Redirect URLs include `http://localhost:3000/**`
- [ ] At least one test user created in **Authentication → Users**
- [ ] `.env.local` has `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- [ ] `npm run check:auth-env` passes

When every box is checked, continue to **Step 2** below.

---

## Step 2 — `authorized_users` membership table

Supabase Auth proves identity; **`authorized_users`** decides who may use the app. Only emails you add here will pass the membership check in Step 5.

### 2.1 Run the SQL

In **Supabase → SQL → New query**, paste and run the full script:

**[`docs/auth-step2.sql`](./auth-step2.sql)**

That creates:

| Column | Purpose |
|--------|---------|
| `user_id` | UUID from **Authentication → Users** (FK to `auth.users`) |
| `email` | Copy of email for easy admin |
| `created_at` | When they were allowlisted |

RLS policies:

- **Logged-in user** can `select` their own row (`auth.uid() = user_id`) — used later to check membership.
- **Service role** can insert/update/delete — used by CLI scripts and server admin.

### 2.2 Add your test user as a member

**Option A — CLI (recommended)**

User must already exist in **Authentication → Users** (Step 1.4):

```bash
npm run auth:add-member -- your@email.com
```

**Option B — SQL**

Replace UUID and email from **Authentication → Users**:

```sql
insert into authorized_users (user_id, email)
values ('YOUR_USER_UUID', 'your@email.com');
```

### 2.3 Verify Step 2

```bash
npm run check:auth-step2
```

Optional: add to `.env.local` to assert a specific email is allowlisted:

```
AUTH_TEST_EMAIL=your@email.com
```

Then run `npm run check:auth-step2` again — it should confirm that email.

### Step 2 checklist

- [ ] Ran `docs/auth-step2.sql` in Supabase SQL editor
- [ ] Added at least one row to `authorized_users` (CLI or SQL)
- [ ] `npm run check:auth-step2` passes

When done, say **“let’s do step 3”** for Supabase SSR clients and middleware.

---

## Step 3 — `@supabase/ssr` clients + middleware

Session cookies are managed by Supabase SSR helpers. **Middleware** refreshes the session and blocks unauthenticated access to protected routes.

### 3.1 What was added

| File | Role |
|------|------|
| `src/lib/supabase/client.ts` | Browser client (`createBrowserClient`) |
| `src/lib/supabase/server.ts` | Server client — Route Handlers, Server Components |
| `src/lib/supabase/middleware.ts` | Session refresh + route guards |
| `src/middleware.ts` | Next.js entry — runs on matched paths |
| `src/lib/auth/routes.ts` | Protected prefixes: `/dashboard`, `/admin` |

**Keep using** `src/lib/supabaseServer.ts` (`getSupabaseAdminClient`) for service-role DB writes — that is separate from user sessions.

Placeholder pages (Step 4/5 will replace):

- `/login` — redirect target when logged out
- `/dashboard` — minimal protected page to verify session

### 3.2 Install (if needed)

```bash
npm install @supabase/ssr
```

### 3.3 Verify Step 3

```bash
npm run check:auth-step3
```

With `npm run dev` running:

1. Open **http://localhost:3000/dashboard** → redirects to `/login?next=/dashboard`
2. Open **http://localhost:3000/admin** → redirects to `/login?next=/admin`
3. Public routes (`/`, `/demo/...`) still work without login

After **Step 4**, signing in should land you on `/dashboard` with your email shown.

### Step 3 checklist

- [ ] `@supabase/ssr` installed
- [ ] `npm run check:auth-step3` passes
- [ ] `/dashboard` and `/admin` redirect to `/login` when logged out

Say **“let’s do step 4”** for the email/password login form.

---

## Step 4 — Login page (email + password)

Sign-in uses a **Server Action** so Supabase sets session cookies correctly via `src/lib/supabase/server.ts`.

### 4.1 What was added

| File | Role |
|------|------|
| `src/app/login/page.tsx` | Login shell; reads `?next=` redirect target |
| `src/app/login/LoginForm.tsx` | Client form (email, password, errors) |
| `src/app/login/actions.ts` | `loginAction` + `logoutAction` |
| `src/app/dashboard/page.tsx` | **Sign out** button for testing |

Flow:

1. User submits email/password → `signInWithPassword`
2. On success → redirect to `next` (default `/dashboard`)
3. On failure → error message on the form
4. **Sign out** on dashboard → `/login`

### 4.2 Verify Step 4

```bash
npm run check:auth-step4
```

Manual test (dev server running):

1. Open **http://localhost:3000/login**
2. Sign in with your Supabase Auth user (Step 1)
3. You should land on **/dashboard** with your email shown
4. Click **Sign out** → back to `/login`
5. Try a wrong password → error stays on login page

> **Note:** Step 5 adds the `authorized_users` check. Until then, any valid Supabase Auth user can reach `/dashboard`.

### Step 4 checklist

- [ ] Login form works at `/login`
- [ ] Successful sign-in reaches `/dashboard`
- [ ] Sign out works
- [ ] `npm run check:auth-step4` passes

Say **“let’s do step 5”** for membership gating on the dashboard.

---

## Step 5 — Dashboard + membership check

Only users in **`authorized_users`** may use `/dashboard` and `/admin`.

### 5.1 What was added

| File | Role |
|------|------|
| `src/lib/auth/membership.ts` | `isAuthorizedMember`, `requireAuthorizedMember` |
| `src/app/dashboard/layout.tsx` | Membership gate for dashboard |
| `src/app/admin/layout.tsx` | Membership gate for all admin pages |
| `src/app/dashboard/page.tsx` | Member home with links to admin tools |
| `src/app/not-authorized/page.tsx` | Shown when signed in but not allowlisted |
| `src/app/login/actions.ts` | Blocks login if not in `authorized_users` |

Flow:

1. Sign in → query `authorized_users` for `auth.uid()`
2. Not listed → sign out + redirect to `/not-authorized`
3. Listed → `/dashboard` with links to `/admin`, stats, errors, demo
4. Direct visit to `/admin` without membership → `/not-authorized`

### 5.2 Verify Step 5

```bash
npm run check:auth-step2    # table + at least one member
npm run check:auth-step5    # files + wiring
```

Manual test:

1. `npm run auth:add-member -- your@email.com`
2. Sign in → **/dashboard** shows admin links
3. Open **/admin** — works for members
4. Delete your row from `authorized_users` in Supabase → sign in again → **/not-authorized**

### Step 5 checklist

- [ ] Test user in `authorized_users`
- [ ] Member can reach `/dashboard` and `/admin`
- [ ] Non-member sees `/not-authorized`
- [ ] `npm run check:auth-step5` passes

Auth setup complete. Step 6 protects `/api/admin/*` with the same membership check.

---

## Step 6 — Protect `/api/admin/*` API routes

Admin pages were gated in Step 5, but **API routes** under `/api/admin/*` were still reachable without a session. Step 6 closes that gap in **middleware**.

### 6.1 What was added

| File | Role |
|------|------|
| `src/lib/auth/apiGuard.ts` | `adminApiGuardResponse` → JSON `401` / `403` |
| `src/lib/auth/routes.ts` | `isAdminApiPath()` |
| `src/lib/supabase/middleware.ts` | Guards all `/api/admin/*` + membership on `/dashboard` / `/admin` pages |

Behavior:

| Request | No session | Session, not a member | Member |
|---------|------------|------------------------|--------|
| `GET /api/admin/health` | `401` JSON | `403` JSON | Route runs |
| `GET /admin` | Redirect `/login` | Redirect `/not-authorized` | Page loads |

### 6.2 Verify Step 6

```bash
npm run check:auth-step6
```

With dev server running, logged **out**:

```powershell
Invoke-WebRequest -Uri "http://localhost:3000/api/admin/health" -UseBasicParsing
```

Expect **401** with `{ "ok": false, "error": "Unauthorized" }`.

While **signed in** as a member, open DevTools on `/dashboard` and run:

```javascript
fetch("/api/admin/health").then((r) => r.json()).then(console.log)
```

### Step 6 checklist

- [ ] Logged-out `/api/admin/health` → `401`
- [ ] Member session → admin API works from browser
- [ ] `npm run check:auth-step6` passes

---

## Step 7 — Roles and per-user screenplays

Three member roles:

| Role | Dashboard |
|------|-----------|
| `administrator` | Links to **Admin** and **Screenplay stats** (all screenplays) |
| `user` | Table of **your** screenplays (`owner_id` = your Auth user) |
| `test` | Same as `user` (isolated test account workflow) |

### 7.1 Run the SQL migration

In Supabase **SQL editor**, run:

```
docs/auth-roles.sql
```

This adds `authorized_users.role` and `screenplays.owner_id`.

### 7.2 Add members with roles

```bash
npm run auth:add-member -- dev@example.com administrator
npm run auth:add-member -- writer@example.com user
npm run auth:add-member -- tester@example.com test
```

Promote an existing member:

```sql
update authorized_users set role = 'administrator' where email = 'you@example.com';
```

### 7.3 How screenplays are owned

Member parses use **`POST /api/member/parse`** (from **Dashboard → Parse new**). Those rows get `owner_id` set to the signed-in user.

The public **`/demo`** workflow and **`POST /api/parse`** are unchanged: no login required, and screenplays are **not** assigned to any user (`owner_id` stays null).

### 7.4 Access rules

- `/dashboard` — any member (`user`, `test`, or `administrator`)
- `/admin` and `/api/admin/*` — **administrator** only (others redirect to `/dashboard` or get `403`)

### Step 7 checklist

- [ ] `docs/auth-roles.sql` applied
- [ ] At least one `administrator` member
- [ ] Administrator dashboard shows admin + screenplay stats links only
- [ ] User/test dashboard lists owned screenplays after parsing while signed in

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| `Invalid login credentials` later | Wrong password, or user doesn’t exist in **Authentication → Users** |
| Redirect loop after login | Site URL / Redirect URLs don’t include your dev host |
| `check:auth-env` missing vars | Create `.env.local` from `.env.example` |
| Auth API not reachable | Wrong `NEXT_PUBLIC_SUPABASE_URL` or network/firewall |
| `authorized_users` does not exist | Run `docs/auth-step2.sql` in Supabase SQL editor |
| `auth:add-member` user not found | Create user in **Authentication → Users** first |
| Logged in but “not a member” later | Add email via `npm run auth:add-member -- email` |
| `/dashboard` does not redirect | Restart dev server after adding `src/middleware.ts` |
| Redirect loop on `/login` | Clear cookies for localhost; check Supabase redirect URLs |
| `Node.js 20 detected without native WebSocket` | Fixed in repo via `ws` package — run `npm install` and retry |
| Admin API returns `401` while signed in | Call from same browser session; cookies must be sent |
| Admin API returns `403` | User is not an **administrator** — run `npm run auth:add-member -- email administrator` |
| Non-admin sees admin links on dashboard | Run `docs/auth-roles.sql`; only `administrator` role gets admin links |
| Vercel build fails on `/admin/*` prerender | Set Supabase env vars in Vercel project settings; `/admin` and `/dashboard` use `force-dynamic` |

## Deploying (Vercel)

Add these in **Project → Settings → Environment Variables** (Production + Preview):

| Variable | Required |
|----------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes (server DB writes) |

Also add your app URL to Supabase **Authentication → URL Configuration** redirect URLs (e.g. `https://your-app.vercel.app/**`).

Without the `NEXT_PUBLIC_*` vars, login and protected pages will fail at **runtime** even if the build succeeds.
