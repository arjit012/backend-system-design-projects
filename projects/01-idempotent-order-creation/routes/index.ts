import express, { type Router } from "express";

import { HealthCheckRoutes } from "./healthCheck.js";
import { OrdersRoutes } from "./orders.js";

export class AppRoutes {
  public readonly router: Router;

  public constructor(
    private readonly healthCheckRoutes = new HealthCheckRoutes(),
    private readonly ordersRoutes = new OrdersRoutes(),
  ) {
    this.router = express.Router();
    this.registerRoutes();
  }

  private registerRoutes(): void {
    this.router.use("/health", this.healthCheckRoutes.router);
    this.router.use("/orders", this.ordersRoutes.router);
  }
}
