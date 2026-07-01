/**
 * Step 4 verification: login form and server actions.
 * Run: npm run check:auth-step4
 */
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = process.cwd();
let failed = false;

console.log("Checking login page (Step 4)...\n");

const requiredFiles = [
  "src/app/login/page.tsx",
  "src/app/login/LoginForm.tsx",
  "src/app/login/actions.ts",
];

for (const file of requiredFiles) {
  if (existsSync(resolve(root, file))) {
    console.log(`  OK    ${file}`);
  } else {
    console.error(`  FAIL  missing ${file}`);
    failed = true;
  }
}

const actionsSource = readFileSync(
  resolve(root, "src/app/login/actions.ts"),
  "utf8",
);
if (actionsSource.includes("signInWithPassword")) {
  console.log("  OK    loginAction uses signInWithPassword");
} else {
  console.error("  FAIL  loginAction missing signInWithPassword");
  failed = true;
}

if (actionsSource.includes("signOut")) {
  console.log("  OK    logoutAction uses signOut");
} else {
  console.error("  FAIL  logoutAction missing signOut");
  failed = true;
}

console.log("\nManual checks (dev server running):");
console.log("  1. http://localhost:3000/login — email/password form");
console.log("  2. Sign in with Supabase Auth user → lands on /dashboard");
console.log("  3. Sign out → back to /login");
console.log("  4. Wrong password → error on login form (no redirect)");

console.log("");
if (failed) {
  console.error("Step 4 check failed. See docs/auth-setup.md Step 4.");
  process.exit(1);
}

console.log("Step 4 file check passed.");
console.log("Next: Step 5 in docs/auth-setup.md (membership check on dashboard).");
