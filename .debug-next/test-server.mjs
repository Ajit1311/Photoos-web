import next from "../node_modules/next/dist/server/next.js";
import http from "node:http";

const app = next({
  dev: true,
  dir: process.cwd(),
  hostname: "127.0.0.1",
  port: 3099,
});

const handle = app.getRequestHandler();

console.log("BEFORE PREPARE");

await app.prepare();

console.log("AFTER PREPARE");

const server = http.createServer((req, res) => {
  console.log("REQUEST", req.method, req.url);
  return handle(req, res);
});

server.listen(3099, "127.0.0.1", () => {
  console.log("LISTENING 3099");
});
