import express, {
  type Express,
  type NextFunction,
  type Request,
  type Response,
} from "express";

import { AppRoutes } from "./routes/index.js";
import { IdempotencyConflictError } from "./services/orders.js";

export class App {
  public readonly app: Express;

  public constructor(private readonly appRoutes = new AppRoutes()) {
    this.app = express();
    this.configureMiddleware();
    this.configureRoutes();
    this.configureErrorHandling();
  }

  private configureMiddleware(): void {
    this.app.use(express.json());
  }

  private configureRoutes(): void {
    this.app.use(this.appRoutes.router);
  }

  private configureErrorHandling(): void {
    this.app.use(
      (error: unknown, _req: Request, res: Response, _next: NextFunction) => {
        if (error instanceof IdempotencyConflictError) {
          return res.status(409).json({
            message: error.message,
          });
        }

        console.error(error);

        return res.status(500).json({
          message: "Internal server error",
        });
      },
    );
  }
}
