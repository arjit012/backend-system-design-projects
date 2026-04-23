import "dotenv/config";

import { Server } from "./server.js";

const server = new Server();

server.start().catch((error) => {
  console.error("Server failed to start", error);
  process.exit(1);
});

process.on("SIGINT", async () => {
  await server.stop();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  await server.stop();
  process.exit(0);
});
