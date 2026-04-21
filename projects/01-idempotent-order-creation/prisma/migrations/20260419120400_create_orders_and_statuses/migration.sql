-- CreateTable
CREATE TABLE "order_statuses" (
    "id" INTEGER NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "order_statuses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "orders" (
    "id" TEXT NOT NULL,
    "order_status_id" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "order_statuses_code_key" ON "order_statuses"("code");

-- CreateIndex
CREATE INDEX "orders_order_status_id_idx" ON "orders"("order_status_id");

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_order_status_id_fkey" FOREIGN KEY ("order_status_id") REFERENCES "order_statuses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
