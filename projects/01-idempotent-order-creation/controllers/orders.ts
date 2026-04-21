import type { NextFunction, Request, Response } from "express";

import { OrdersService } from "../services/orders.js";

type CreateOrderPayload = {
  products?: unknown;
};

export class OrdersController {
  public constructor(private readonly ordersService = new OrdersService()) {}

  public create = async (
    req: Request<unknown, unknown, CreateOrderPayload>,
    res: Response,
    next: NextFunction,
  ): Promise<Response | void> => {
    try {
      const idempotencyKey = req.header("Idempotency-Key");

      if (!idempotencyKey) {
        return res.status(400).json({
          message: "Idempotency-Key header is required.",
        });
      }

      const parsedProducts = this.getProducts(req.body);

      if (!parsedProducts.isValid) {
        return res.status(400).json({
          message: parsedProducts.message,
        });
      }

      const result = await this.ordersService.createOrder(
        {
          products: parsedProducts.products,
        },
        idempotencyKey,
      );

      return res.status(201).json(result);
    } catch (error) {
      return next(error);
    }
  };

  private getProducts(
    payload: CreateOrderPayload,
  ): { isValid: true; products: string[] } | { isValid: false; message: string } {
    if (!Array.isArray(payload.products)) {
      return {
        isValid: false,
        message: "Products must be an array.",
      };
    }

    if (!payload.products.every((product) => typeof product === "string")) {
      return {
        isValid: false,
        message: "Every product must be a string.",
      };
    }

    return {
      isValid: true,
      products: payload.products,
    };
  }
}
