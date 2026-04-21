-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "products" TEXT[] DEFAULT ARRAY[]::TEXT[];
