import type { Server as HttpServer } from "node:http";

import { App } from "./app.js";

export class Server {
  private readonly app: App;
  private readonly port: number;
  private httpServer?: HttpServer;

  public constructor(app = new App(), port = Number(process.env.PORT) || 3000) {
    this.app = app;
    this.port = port;
  }

  public async start(): Promise<void> {
    await this.app.bootstrap();

    this.httpServer = this.app.app.listen(this.port, () => {
      console.log(`Server is listening at port ${this.port}`);
    });
  }

  public async stop(): Promise<void> {
    if (this.httpServer) {
      await new Promise<void>((resolve) => {
        this.httpServer?.close(() => {
          resolve();
        });
      });

      this.httpServer = undefined;
    }

    await this.app.shutdown();
  }
}
