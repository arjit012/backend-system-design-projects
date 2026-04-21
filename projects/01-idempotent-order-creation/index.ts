import "dotenv/config";

import { Server } from "./server.js";

const server = new Server();

server.start().catch(() => {
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
