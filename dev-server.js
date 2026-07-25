import { createServer } from "http";
import handler from "./api/chat.js";

function addExpressLike(res) {
  res.status = function (code) {
    res.statusCode = code;
    return res;
  };
  res.json = function (data) {
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify(data));
  };
  return res;
}

const server = createServer((req, res) => {
  addExpressLike(res);

  if (req.method === "POST" && req.url === "/api/chat") {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => {
      try {
        req.body = JSON.parse(body);
      } catch {
        req.body = {};
      }
      handler(req, res);
    });
  } else if (req.url === "/api/chat") {
    handler(req, res);
  } else {
    res.status(404).json({ error: "Not found" });
  }
});

server.listen(3001, () => {
  console.log("Local API server running on http://localhost:3001");
});
