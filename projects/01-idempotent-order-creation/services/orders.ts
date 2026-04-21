import { createHash } from "node:crypto";

import { getPrismaClient } from "../database/prisma.js";
import type {
  Order,
  Prisma,
  PrismaClient,
} from "../generated/prisma/client.js";

export type CreateOrderInput = {
  products: string[];
};

export type CreateOrderResponse = {
  message: string;
  data: Order;
};

export class IdempotencyConflictError extends Error {
  public constructor() {
    super(
      "Idempotency-Key has already been used with a different request payload.",
    );
    this.name = "IdempotencyConflictError";
  }
}

export class OrdersService {
  public constructor(private readonly db: PrismaClient = getPrismaClient()) {}

  public async checkDuplicateOrder(idempotencyKey: string) {
    return this.db.idempotent.findUnique({
      where: {
        idempotentKey: idempotencyKey,
      },
    });
  }

  public async createOrder(input: CreateOrderInput, idempotencyKey: string) {
    const existingRecord = await this.checkDuplicateOrder(idempotencyKey);
    const requestHash = this.createRequestHash(input);

    if (existingRecord) {
      if (
        this.isDifferentRequestHash(requestHash, existingRecord.requestHash)
      ) {
        throw new IdempotencyConflictError();
      }

      if (existingRecord.response) {
        return existingRecord.response;
      }
    }

    return this.db.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          products: input.products,
        },
      });

      const response: CreateOrderResponse = {
        message: "Order created successfully.",
        data: order,
      };

      await tx.idempotent.create({
        data: {
          idempotentKey: idempotencyKey,
          requestHash,
          response: response as Prisma.InputJsonValue,
          expiresAt: this.getExpiryDate(),
        },
      });

      return response;
    });
  }

  private isDifferentRequestHash(hash1: string, hash2: string) {
    return hash1 !== hash2;
  }

  private createRequestHash(input: CreateOrderInput): string {
    return createHash("sha256").update(JSON.stringify(input)).digest("hex");
  }

  private getExpiryDate(): Date {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 1);

    return expiresAt;
  }
}
