/**
 * Add a Supabase Auth user to authorized_users by email.
 * Run: npm run auth:add-member -- dev@example.com [role]
 *
 * role: administrator | user | test (default: user)
 */
import { config } from "dotenv";
import { resolve } from "node:path";
import { createServiceRoleClient } from "./lib/supabase-service.mjs";

config({ path: resolve(process.cwd(), ".env.local") });

const email = process.argv[2]?.trim().toLowerCase();
const roleArg = process.argv[3]?.trim().toLowerCase() ?? "user";
const VALID_ROLES = new Set(["administrator", "user", "test"]);

if (!email || !email.includes("@")) {
  console.error("Usage: npm run auth:add-member -- your@email.com [role]");
  console.error("Roles: administrator | user | test (default: user)");
  console.error("The user must already exist in Supabase Authentication → Users.");
  process.exit(1);
}

if (!VALID_ROLES.has(roleArg)) {
  console.error(`Invalid role: ${roleArg}`);
  console.error("Roles: administrator | user | test");
  process.exit(1);
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "");
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const supabase = createServiceRoleClient(url, serviceKey);

console.log(`Looking up Auth user: ${email} (role: ${roleArg})`);

const { data: listData, error: listError } = await supabase.auth.admin.listUsers({
  page: 1,
  perPage: 1000,
});

if (listError) {
  console.error("Failed to list users:", listError.message);
  process.exit(1);
}

const authUser = listData.users.find(
  (u) => u.email?.toLowerCase() === email,
);

if (!authUser) {
  console.error(`No Auth user found for ${email}.`);
  console.error("Create them first: Supabase Dashboard → Authentication → Users → Add user");
  process.exit(1);
}

const { data: inserted, error: insertError } = await supabase
  .from("authorized_users")
  .upsert(
    { user_id: authUser.id, email: authUser.email ?? email, role: roleArg },
    { onConflict: "user_id" },
  )
  .select("id, user_id, email, role")
  .single();

if (insertError) {
  console.error("Failed to insert authorized_users row:", insertError.message);
  if (insertError.message.includes("does not exist")) {
    console.error("Run docs/auth-step2.sql in Supabase SQL editor first.");
  }
  if (insertError.message.includes("role")) {
    console.error("Run docs/auth-roles.sql to add the role column.");
  }
  process.exit(1);
}

console.log("Member added/updated:");
console.log(inserted);
console.log("\nVerify: npm run check:auth-step2");
