// Smoke test for admin connectivity endpoints.
// Requires dev server running (SMOKE_URL defaults to http://localhost:3000).
// Run with: npm run smoke:admin

const baseUrl = process.env.SMOKE_URL || "http://localhost:3000";

const check = async (path, method = "GET", body) => {
  const res = await fetch(`${baseUrl}${path}`, {
    method,
    headers: { "content-type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    json = null;
  }
  if (!res.ok || (json && json.ok === false)) {
    throw new Error(`${path} failed: ${res.status} ${res.statusText} ${text}`);
  }
  return json ?? text;
};

const main = async () => {
  console.log(`Smoke against ${baseUrl}`);

  console.log("Checking /api/admin/db-check ...");
  const db = await check("/api/admin/db-check", "POST");
  console.log("db-check OK", db);

  console.log("Checking /api/admin/health ...");
  const health = await check("/api/admin/health");
  console.log("health OK", health);

  console.log("Smoke admin passed.");
};

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

