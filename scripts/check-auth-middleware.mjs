/**
 * Step 3 verification: @supabase/ssr installed and auth files present.
 * Run: npm run check:auth-step3
 */
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { readFileSync } from "node:fs";

const root = process.cwd();
let failed = false;

console.log("Checking Supabase SSR setup (Step 3)...\n");

try {
  const pkg = JSON.parse(readFileSync(resolve(root, "package.json"), "utf8"));
  if (pkg.dependencies?.["@supabase/ssr"]) {
    console.log("  OK    @supabase/ssr in package.json");
  } else {
    console.error("  FAIL  @supabase/ssr not installed — run: npm install @supabase/ssr");
    failed = true;
  }
} catch {
  console.error("  FAIL  Could not read package.json");
  failed = true;
}

const requiredFiles = [
  "src/middleware.ts",
  "src/lib/supabase/client.ts",
  "src/lib/supabase/server.ts",
  "src/lib/supabase/middleware.ts",
  "src/lib/auth/routes.ts",
  "src/app/login/page.tsx",
  "src/app/dashboard/page.tsx",
];

for (const file of requiredFiles) {
  if (existsSync(resolve(root, file))) {
    console.log(`  OK    ${file}`);
  } else {
    console.error(`  FAIL  missing ${file}`);
    failed = true;
  }
}

console.log("\nManual checks (dev server running):");
console.log("  1. Visit http://localhost:3000/dashboard → should redirect to /login?next=/dashboard");
console.log("  2. Visit http://localhost:3000/admin → should redirect to /login?next=/admin");
console.log("  3. After Step 4 login, /dashboard should load while signed in");

console.log("");
if (failed) {
  console.error("Step 3 file check failed. See docs/auth-setup.md Step 3.");
  process.exit(1);
}

console.log("Step 3 file check passed.");
console.log("Next: Step 4 in docs/auth-setup.md (login form).");
