// Smoke test for the generate-audio API route.
// Requires dev server running on http://localhost:3000 and ELEVENLABS_API_KEY set in .env.local.
// Run with: npm run smoke:generate

const target = process.env.SMOKE_URL ?? "http://localhost:3000";
const endpoint = `${target}/api/generate-audio`;

const payload = {
  scene_id: "smoke-scene-1",
  dialogue: [
    { character: "TEST_A", text: "Hello from the smoke test." },
    { character: "TEST_B", text: "Replying from the other side." },
  ],
};

const main = async () => {
  console.log(`POST ${endpoint}`);
  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
  });

  console.log("Status:", res.status, res.statusText);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Smoke failed: ${res.status} ${res.statusText}\n${text}`);
  }

  const data = await res.json();
  if (!data?.audio_url || typeof data.audio_url !== "string") {
    throw new Error("Smoke failed: missing audio_url in response");
  }
  if (!data.audio_url.startsWith("data:audio/")) {
    throw new Error(`Smoke failed: unexpected audio_url format: ${data.audio_url.slice(0, 30)}...`);
  }

  console.log("Received audio_url (truncated):", data.audio_url.slice(0, 60), "...");
  console.log("Smoke test passed.");
};

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

