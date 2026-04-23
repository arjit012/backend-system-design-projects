import express, {
  type Express,
  type NextFunction,
  type Request,
  type Response,
} from "express";

import { AppRoutes } from "./routes/index.js";
import { RedisClient } from "./config/redis.js";
import { RateLimiter } from "./utils/RateLimiter.js";

const parsedCapacity = Number(process.env.RATE_LIMIT_CAPACITY);
const parsedRefillRate = Number(process.env.RATE_LIMIT_REFILL_RATE);

const CAPACITY = Number.isFinite(parsedCapacity) ? parsedCapacity : 10;
const REFILL_RATE = Number.isFinite(parsedRefillRate) ? parsedRefillRate : 2;

export class App {
  public readonly app: Express;
  private readonly redisClient: RedisClient = new RedisClient();
  private readonly rateLimiter: RateLimiter = new RateLimiter(
    this.redisClient,
    CAPACITY,
    REFILL_RATE,
  );

  public constructor(private readonly appRoutes = new AppRoutes()) {
    this.app = express();
    this.configureMiddleware();
    this.configureRoutes();
    this.configureErrorHandling();
  }

  private configureMiddleware(): void {
    this.app.use(this.rateLimiter.rateLimiterCheck.bind(this.rateLimiter));
    this.app.use(express.json());
  }

  private configureRoutes(): void {
    this.app.use(this.appRoutes.router);
  }

  private configureErrorHandling(): void {
    this.app.use(
      (error: unknown, _req: Request, res: Response, _next: NextFunction) => {
        console.error(error);

        return res.status(500).json({
          message: "Internal server error",
        });
      },
    );
  }

  public async bootstrap(): Promise<void> {
    await this.redisClient.connect();
    console.log("Redis connected successfully");
  }

  public async shutdown(): Promise<void> {
    await this.redisClient.disconnect();
  }
}
