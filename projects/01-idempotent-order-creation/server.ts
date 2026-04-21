import type { Server as HttpServer } from "node:http";
import { App } from "./app.js";
import { connectDatabase, disconnectDatabase } from "./database/prisma.js";

export class Server {
  private readonly app: App;
  private readonly port: number;
  private httpServer?: HttpServer;

  public constructor(app = new App(), port = Number(process.env.PORT) || 3000) {
    this.app = app;
    this.port = port;
  }

  public async start(): Promise<void> {
    await this.connectDatabase();

    this.httpServer = this.app.app.listen(this.port, () => {
      console.log(`Server is listening at port ${this.port}`);
    });
  }

  public async stop(): Promise<void> {
    if (!this.httpServer) return;

    await new Promise<void>((resolve) => {
      this.httpServer?.close(() => {
        resolve();
      });
    });

    await disconnectDatabase();
  }
  private async connectDatabase(): Promise<void> {
    try {
      await connectDatabase();
      console.log("Database connection established successfully.");
    } catch (error) {
      console.error(
        "Failed to connect to the database. Server startup aborted.",
      );
      console.error(error);
      throw error;
    }
  }
}
