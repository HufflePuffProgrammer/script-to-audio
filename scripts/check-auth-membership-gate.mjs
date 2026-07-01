/**
 * Step 5 verification: membership helpers and layouts.
 * Run: npm run check:auth-step5
 */
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = process.cwd();
let failed = false;

console.log("Checking membership gate (Step 5)...\n");

const requiredFiles = [
  "src/lib/auth/membership.ts",
  "src/app/dashboard/layout.tsx",
  "src/app/admin/layout.tsx",
  "src/app/not-authorized/page.tsx",
];

for (const file of requiredFiles) {
  if (existsSync(resolve(root, file))) {
    console.log(`  OK    ${file}`);
  } else {
    console.error(`  FAIL  missing ${file}`);
    failed = true;
  }
}

const membershipSource = readFileSync(
  resolve(root, "src/lib/auth/membership.ts"),
  "utf8",
);
if (membershipSource.includes("authorized_users")) {
  console.log("  OK    membership checks authorized_users");
} else {
  console.error("  FAIL  membership.ts missing authorized_users query");
  failed = true;
}

const loginActions = readFileSync(
  resolve(root, "src/app/login/actions.ts"),
  "utf8",
);
if (loginActions.includes("isAuthorizedMember")) {
  console.log("  OK    loginAction checks membership");
} else {
  console.error("  FAIL  loginAction missing membership check");
  failed = true;
}

console.log("\nManual checks:");
console.log("  1. npm run auth:add-member -- your@email.com");
console.log("  2. Sign in at /login → /dashboard (role-based content)");
console.log("  3. Remove row from authorized_users → sign in → /not-authorized");
console.log("  4. /admin requires administrator role (Step 7)");

console.log("");
if (failed) {
  console.error("Step 5 check failed. See docs/auth-setup.md Step 5.");
  process.exit(1);
}

console.log("Step 5 file check passed.");
