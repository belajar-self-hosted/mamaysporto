import assert from "node:assert/strict";

const storage = new Map();
storage.set("mamaysporto_admin_token", "session-a");
storage.set("mamaysporto_admin_user", JSON.stringify({ email: "a@example.com" }));
globalThis.window = {};
globalThis.localStorage = {
  getItem: (key) => storage.get(key) ?? null,
  setItem: (key, value) => storage.set(key, String(value)),
  removeItem: (key) => storage.delete(key),
};

const originalFetch = globalThis.fetch;
const privateRequests = [];
globalThis.fetch = async (url, options = {}) => {
  if (url === "/api/auth/logout") return { ok: true };
  if (url === "/api/auth/login") {
    return {
      ok: true,
      json: async () => ({ token: "session-b", user: { email: "b@example.com" } }),
    };
  }
  if (url.startsWith("/api/data/site_settings?")) {
    const token = options.headers?.Authorization ?? null;
    privateRequests.push(token);
    return {
      ok: true,
      json: async () => ({ ai_system_prompt: token === "Bearer session-a" ? "private-a" : "private-b" }),
    };
  }
  throw new Error(`Unexpected fetch URL: ${url}`);
};

try {
  const [{ fetchCollection }, { signIn, signOut }] = await Promise.all([
    import("../src/lib/api.js"),
    import("../src/lib/auth.js"),
  ]);

  const sessionAData = await fetchCollection("site_settings", { includePrivate: true });
  assert.equal(sessionAData.ai_system_prompt, "private-a");

  await signOut();
  await signIn("b@example.com", "password-for-test");

  const sessionBData = await fetchCollection("site_settings", { includePrivate: true });
  assert.equal(sessionBData.ai_system_prompt, "private-b");
  assert.deepEqual(privateRequests, ["Bearer session-a", "Bearer session-b"]);

  console.log("Private settings cache session isolation passed.");
} finally {
  globalThis.fetch = originalFetch;
  delete globalThis.window;
  delete globalThis.localStorage;
}
