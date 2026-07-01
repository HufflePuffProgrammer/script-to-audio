/**
 * Step 6 verification: admin API auth wiring in middleware.
 * Run: npm run check:auth-step6
 *
 * Optional live check (dev server running):
 *   curl -i http://localhost:3000/api/admin/health  → expect 401
 */
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = process.cwd();
let failed = false;

console.log("Checking admin API auth (Step 6)...\n");

const requiredFiles = [
  "src/lib/auth/apiGuard.ts",
  "src/lib/auth/routes.ts",
  "src/lib/supabase/middleware.ts",
];

for (const file of requiredFiles) {
  if (existsSync(resolve(root, file))) {
    console.log(`  OK    ${file}`);
  } else {
    console.error(`  FAIL  missing ${file}`);
    failed = true;
  }
}

const routesSource = readFileSync(
  resolve(root, "src/lib/auth/routes.ts"),
  "utf8",
);
const middlewareSource = readFileSync(
  resolve(root, "src/lib/supabase/middleware.ts"),
  "utf8",
);

if (routesSource.includes("isAdminApiPath")) {
  console.log("  OK    isAdminApiPath defined");
} else {
  console.error("  FAIL  isAdminApiPath missing");
  failed = true;
}

if (
  middlewareSource.includes("isAdminApiPath") &&
  middlewareSource.includes("adminApiGuardResponse")
) {
  console.log("  OK    middleware guards /api/admin/*");
} else {
  console.error("  FAIL  middleware missing admin API guard");
  failed = true;
}

const baseUrl = process.env.SMOKE_URL || "http://localhost:3000";

try {
  const res = await fetch(`${baseUrl}/api/admin/health`, {
    signal: AbortSignal.timeout(3000),
  });
  if (res.status === 401) {
    console.log(`  OK    GET /api/admin/health without session → 401`);
  } else {
    console.log(
      `  WARN  GET /api/admin/health returned ${res.status} (expected 401 if dev server is up)`,
    );
  }
} catch {
  console.log("  INFO  Skipped live 401 check (dev server not running)");
}

console.log("\nManual checks (signed in as member in browser):");
console.log("  • DevTools → fetch('/api/admin/health') → 200 or health JSON");
console.log("  • Logged out → same fetch → 401");

console.log("");
if (failed) {
  console.error("Step 6 check failed. See docs/auth-setup.md Step 6.");
  process.exit(1);
}

console.log("Step 6 file check passed.");
