-- CreateTable
CREATE TABLE "idempotents" (
    "id" TEXT NOT NULL,
    "idempotent_key" TEXT NOT NULL,
    "request_hash" TEXT NOT NULL,
    "response" JSONB,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "idempotents_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "idempotents_idempotent_key_key" ON "idempotents"("idempotent_key");
