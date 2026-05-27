-- CreateTable
CREATE TABLE "ProviderWebhookEvent" (
    "id" TEXT NOT NULL,
    "provider" "GatewayProvider" NOT NULL,
    "event" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "signature" TEXT,
    "reference" TEXT,
    "payload" JSONB,
    "rawBody" TEXT,
    "errorMessage" TEXT,
    "gatewayId" TEXT,
    "transactionId" TEXT,
    "organizationId" TEXT,
    "receivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProviderWebhookEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GatewaySyncRun" (
    "id" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "imported" INTEGER NOT NULL DEFAULT 0,
    "updated" INTEGER NOT NULL DEFAULT 0,
    "totalFetched" INTEGER NOT NULL DEFAULT 0,
    "message" TEXT,
    "fromDate" TEXT,
    "toDate" TEXT,
    "gatewayId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "GatewaySyncRun_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ProviderWebhookEvent_gatewayId_idx" ON "ProviderWebhookEvent"("gatewayId");

-- CreateIndex
CREATE INDEX "ProviderWebhookEvent_transactionId_idx" ON "ProviderWebhookEvent"("transactionId");

-- CreateIndex
CREATE INDEX "ProviderWebhookEvent_organizationId_idx" ON "ProviderWebhookEvent"("organizationId");

-- CreateIndex
CREATE INDEX "ProviderWebhookEvent_provider_idx" ON "ProviderWebhookEvent"("provider");

-- CreateIndex
CREATE INDEX "ProviderWebhookEvent_receivedAt_idx" ON "ProviderWebhookEvent"("receivedAt");

-- CreateIndex
CREATE INDEX "GatewaySyncRun_gatewayId_idx" ON "GatewaySyncRun"("gatewayId");

-- CreateIndex
CREATE INDEX "GatewaySyncRun_organizationId_idx" ON "GatewaySyncRun"("organizationId");

-- CreateIndex
CREATE INDEX "GatewaySyncRun_startedAt_idx" ON "GatewaySyncRun"("startedAt");

-- AddForeignKey
ALTER TABLE "ProviderWebhookEvent" ADD CONSTRAINT "ProviderWebhookEvent_gatewayId_fkey" FOREIGN KEY ("gatewayId") REFERENCES "Gateway"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProviderWebhookEvent" ADD CONSTRAINT "ProviderWebhookEvent_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "Transaction"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProviderWebhookEvent" ADD CONSTRAINT "ProviderWebhookEvent_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GatewaySyncRun" ADD CONSTRAINT "GatewaySyncRun_gatewayId_fkey" FOREIGN KEY ("gatewayId") REFERENCES "Gateway"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GatewaySyncRun" ADD CONSTRAINT "GatewaySyncRun_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
