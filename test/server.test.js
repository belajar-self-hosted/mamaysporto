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
    console.log("Server healthcheck test passed!");
    server.close();
    process.exit(0);
  } catch (err) {
    console.error("Test failed:", err);
    server.close();
    process.exit(1);
  }
});
