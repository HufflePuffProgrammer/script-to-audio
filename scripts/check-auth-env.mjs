/**
 * Step 1 verification: Supabase env vars + Auth API reachable.
 * Run: npm run check:auth-env
 */
import { config } from "dotenv";
import { resolve } from "node:path";

config({ path: resolve(process.cwd(), ".env.local") });

const REQUIRED = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
];

let failed = false;

console.log("Checking Supabase auth env (Step 1)...\n");

for (const key of REQUIRED) {
  const value = process.env[key];
  if (!value || !value.trim()) {
    console.error(`  FAIL  ${key} — missing (copy .env.example → .env.local)`);
    failed = true;
  } else {
    const hint =
      key === "NEXT_PUBLIC_SUPABASE_URL"
        ? value.replace(/\/$/, "")
        : `${value.slice(0, 8)}…`;
    console.log(`  OK    ${key} (${hint})`);
  }
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "");
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (url && anonKey) {
  console.log("\nChecking Supabase Auth API...");
  try {
    const res = await fetch(`${url}/auth/v1/settings`, {
      headers: {
        apikey: anonKey,
        Authorization: `Bearer ${anonKey}`,
      },
    });
    if (!res.ok) {
      console.error(`  FAIL  Auth API returned ${res.status} ${res.statusText}`);
      failed = true;
    } else {
      const settings = await res.json();
      console.log("  OK    Auth API reachable");
      if (settings.external?.email === true || settings.disable_signup !== undefined) {
        console.log("  OK    Email auth settings loaded from project");
      }
      if (settings.site_url) {
        console.log(`  INFO  Supabase Site URL: ${settings.site_url}`);
        if (
          settings.site_url !== "http://localhost:3000" &&
          !settings.site_url.includes("localhost")
        ) {
          console.log(
            "  WARN  Site URL is not localhost — OK for prod; for dev set Authentication → URL Configuration → http://localhost:3000",
          );
        }
      }
    }
  } catch (err) {
    console.error(
      "  FAIL  Could not reach Auth API:",
      err instanceof Error ? err.message : err,
    );
    failed = true;
  }
}

console.log("");
if (failed) {
  console.error("Step 1 not complete. See docs/auth-setup.md");
  process.exit(1);
}

console.log("Step 1 env check passed.");
console.log("Next: create a test user in Supabase Dashboard if you have not already.");
console.log("Then continue with Step 2 in docs/auth-setup.md (authorized_users).");
