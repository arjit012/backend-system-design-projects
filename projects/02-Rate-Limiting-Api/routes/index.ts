import express, { type Router } from "express";

import { HealthCheckRoutes } from "./healthCheck.js";

export class AppRoutes {
  public readonly router: Router;

  public constructor(
    private readonly healthCheckRoutes = new HealthCheckRoutes(),
  ) {
    this.router = express.Router();
    this.registerRoutes();
  }

  private registerRoutes(): void {
    this.router.use("/health", this.healthCheckRoutes.router);
  }
}
