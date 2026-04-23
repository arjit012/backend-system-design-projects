import express, { type Router } from "express";

import { HealthCheckController } from "../controllers/healthCheck.js";

export class HealthCheckRoutes {
  public readonly router: Router;

  public constructor(
    private readonly healthCheckController = new HealthCheckController(),
  ) {
    this.router = express.Router();
    this.registerRoutes();
  }

  private registerRoutes(): void {
    this.router.get("/", this.healthCheckController.health);
  }
}
