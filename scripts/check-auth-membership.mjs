/**
 * Step 2 verification: authorized_users table exists and is readable.
 * Run: npm run check:auth-step2
 *
 * Optional: set AUTH_TEST_EMAIL in .env.local to verify a specific member row.
 */
import { config } from "dotenv";
import { resolve } from "node:path";
import { createServiceRoleClient } from "./lib/supabase-service.mjs";

config({ path: resolve(process.cwd(), ".env.local") });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "");
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const testEmail = process.env.AUTH_TEST_EMAIL?.trim();

let failed = false;

console.log("Checking authorized_users (Step 2)...\n");

if (!url || !serviceKey) {
  console.error("  FAIL  Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  console.error("        Run npm run check:auth-env first.");
  process.exit(1);
}

const supabase = createServiceRoleClient(url, serviceKey);

const { data: rows, error: tableError } = await supabase
  .from("authorized_users")
  .select("id, user_id, email, created_at")
  .order("created_at", { ascending: false })
  .limit(20);

if (tableError) {
  console.error(`  FAIL  authorized_users: ${tableError.message}`);
  if (tableError.message.includes("does not exist")) {
    console.error("\n  → Run docs/auth-step2.sql in Supabase SQL editor, then retry.");
  }
  process.exit(1);
}

console.log(`  OK    authorized_users table exists (${rows?.length ?? 0} member(s))`);

if (!rows?.length) {
  console.log("\n  WARN  No members yet. Add one:");
  console.log("        npm run auth:add-member -- your@email.com");
  console.log("     or insert manually in SQL (see docs/auth-setup.md Step 2).");
}

for (const row of rows ?? []) {
  console.log(`  INFO  member: ${row.email} (${row.user_id})`);
}

if (testEmail) {
  console.log(`\nChecking AUTH_TEST_EMAIL=${testEmail} ...`);
  const { data: member, error: memberError } = await supabase
    .from("authorized_users")
    .select("user_id, email")
    .eq("email", testEmail)
    .maybeSingle();

  if (memberError) {
    console.error(`  FAIL  ${memberError.message}`);
    failed = true;
  } else if (!member) {
    console.error(`  FAIL  ${testEmail} is not in authorized_users`);
    console.error("        Run: npm run auth:add-member -- " + testEmail);
    failed = true;
  } else {
    console.log(`  OK    ${testEmail} is an authorized member`);
  }
}

console.log("");
if (failed) {
  process.exit(1);
}

console.log("Step 2 check passed.");
console.log("Next: Step 3 in docs/auth-setup.md (@supabase/ssr + middleware).");
