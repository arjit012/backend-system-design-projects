import express, { type Router } from "express";

import { OrdersController } from "../controllers/orders.js";

export class OrdersRoutes {
  public readonly router: Router;

  public constructor(private readonly ordersController = new OrdersController()) {
    this.router = express.Router();
    this.registerRoutes();
  }

  private registerRoutes(): void {
    this.router.post("/", this.ordersController.create);
  }
}
