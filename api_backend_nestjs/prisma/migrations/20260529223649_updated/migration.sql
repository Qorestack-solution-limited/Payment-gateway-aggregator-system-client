-- CreateEnum
CREATE TYPE "AuditAction" AS ENUM ('GATEWAY_CREATED', 'GATEWAY_UPDATED', 'GATEWAY_DELETED', 'GATEWAY_TOGGLED', 'GATEWAY_VALIDATED', 'GATEWAY_SYNCED', 'TRANSACTION_STATUS_UPDATED', 'TRANSACTION_REFUNDED', 'API_KEY_GENERATED', 'API_KEY_REVOKED', 'API_KEY_DELETED', 'WEBHOOK_CREATED', 'WEBHOOK_DELETED', 'PROFILE_UPDATED', 'PASSWORD_CHANGED', 'TWO_FACTOR_ENABLED', 'TWO_FACTOR_DISABLED', 'PLAN_CHANGED');

-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN     "refundId" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "notificationPreferences" JSONB;

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "action" "AuditAction" NOT NULL,
    "actorId" TEXT NOT NULL,
    "actorEmail" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "resourceType" TEXT NOT NULL,
    "resourceId" TEXT,
    "description" TEXT,
    "before" JSONB,
    "after" JSONB,
    "ipAddress" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AuditLog_organizationId_idx" ON "AuditLog"("organizationId");

-- CreateIndex
CREATE INDEX "AuditLog_actorId_idx" ON "AuditLog"("actorId");

-- CreateIndex
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

-- CreateIndex
CREATE INDEX "AuditLog_resourceType_idx" ON "AuditLog"("resourceType");
