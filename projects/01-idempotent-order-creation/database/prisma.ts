import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "../generated/prisma/client.js";

let prisma: PrismaClient | null = null;

export function getPrismaClient(): PrismaClient {
  if (prisma) {
    return prisma;
  }

  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("DATABASE_URL is required.");
  }

  const adapter = new PrismaPg({ connectionString });
  prisma = new PrismaClient({ adapter });

  return prisma;
}

export async function connectDatabase(): Promise<void> {
  await getPrismaClient().$connect();
}

export async function disconnectDatabase(): Promise<void> {
  await prisma?.$disconnect();
}
