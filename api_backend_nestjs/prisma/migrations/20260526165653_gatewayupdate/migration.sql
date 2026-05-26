-- AlterTable
ALTER TABLE "Gateway" ADD COLUMN     "lastSyncMessage" TEXT,
ADD COLUMN     "lastSyncStatus" TEXT,
ADD COLUMN     "lastSyncedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN     "lastSyncedAt" TIMESTAMP(3),
ADD COLUMN     "providerPayload" JSONB,
ADD COLUMN     "providerReference" TEXT,
ADD COLUMN     "providerStatus" TEXT,
ADD COLUMN     "providerTransactionId" TEXT,
ADD COLUMN     "syncedFromProvider" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "IdempotencyRequest" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "requestHash" TEXT NOT NULL,
    "response" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "IdempotencyRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "IdempotencyRequest_organizationId_idx" ON "IdempotencyRequest"("organizationId");

-- CreateIndex
CREATE INDEX "IdempotencyRequest_createdAt_idx" ON "IdempotencyRequest"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "IdempotencyRequest_organizationId_key_path_key" ON "IdempotencyRequest"("organizationId", "key", "path");
