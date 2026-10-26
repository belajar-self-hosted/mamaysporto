import assert from "node:assert/strict";
import http from "node:http";
import app from "../server/index.js";

const server = http.createServer(app);

server.listen(3099, async () => {
  console.log("Test server started on port 3099");

  try {
    const res = await fetch("http://localhost:3099/api/health");
    const json = await res.json();
    console.log("Healthcheck response:", json);
    assert(json.status === "ok" || json.status === "degraded");
    assert(typeof json.uptime === "number");

    // Test PUT /api/auth/account requires authentication
    const unauthRes = await fetch("http://localhost:3099/api/auth/account", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "test@example.com" }),
    });
    assert.equal(unauthRes.status, 401, "Expected 401 Unauthorized without Bearer token");
    console.log("PUT /api/auth/account auth protection test passed!");

    console.log("All server tests passed!");
    server.close();
    process.exit(0);
  } catch (err) {
    console.error("Test failed:", err);
    server.close();
    process.exit(1);
  }
});
