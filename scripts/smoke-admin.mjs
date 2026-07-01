// Smoke test for admin connectivity endpoints.
// Requires dev server running (SMOKE_URL defaults to http://localhost:3000).
// NOTE: After auth Step 6, /api/admin/* requires a logged-in member session.
// This script runs without cookies and expects 401 — use browser DevTools while
// signed in to test successful responses, or run: npm run check:auth-step6

const baseUrl = process.env.SMOKE_URL || "http://localhost:3000";

const checkUnauthorized = async (path, method = "GET", body) => {
  const res = await fetch(`${baseUrl}${path}`, {
    method,
    headers: { "content-type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  if (res.status !== 401) {
    throw new Error(
      `${path} expected 401 Unauthorized without session, got ${res.status}: ${text}`,
    );
  }
  return text;
};

const main = async () => {
  console.log(`Smoke against ${baseUrl} (unauthenticated — expect 401)`);

  console.log("Checking /api/admin/db-check ...");
  await checkUnauthorized("/api/admin/db-check", "POST");
  console.log("db-check correctly returned 401");

  console.log("Checking /api/admin/health ...");
  await checkUnauthorized("/api/admin/health");
  console.log("health correctly returned 401");

  console.log("Smoke admin passed (routes are protected).");
  console.log("Sign in at /login and run fetch('/api/admin/health') in DevTools to test member access.");
};

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
