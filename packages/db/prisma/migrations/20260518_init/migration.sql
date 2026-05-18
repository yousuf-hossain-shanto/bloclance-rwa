-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "KycStatus" AS ENUM ('NotVerified', 'Pending', 'Verified');

-- CreateEnum
CREATE TYPE "Asset" AS ENUM ('XRP', 'RLUSD');

-- CreateEnum
CREATE TYPE "PropertyStatus" AS ENUM ('Active', 'SoldOut', 'Closed');

-- CreateEnum
CREATE TYPE "OrderSide" AS ENUM ('Buy', 'Sell');

-- CreateEnum
CREATE TYPE "OrderType" AS ENUM ('Market', 'Limit');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('Open', 'PartiallyFilled', 'Filled', 'Cancelled', 'Expired', 'Failed');

-- CreateEnum
CREATE TYPE "PurchaseStatus" AS ENUM ('Pending', 'Confirmed', 'Failed');

-- CreateEnum
CREATE TYPE "WithdrawalStatus" AS ENUM ('Pending', 'Submitted', 'Confirmed', 'Failed');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "displayName" TEXT,
    "avatarUrl" TEXT,
    "kycStatus" "KycStatus" NOT NULL DEFAULT 'NotVerified',
    "kycProviderRef" TEXT,
    "xrpAddress" TEXT NOT NULL,
    "privyUserId" TEXT,
    "autoReinvest" BOOLEAN NOT NULL DEFAULT false,
    "lastLoginAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "properties" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "locationCity" TEXT NOT NULL,
    "locationRegion" TEXT NOT NULL,
    "heroImageUrl" TEXT NOT NULL,
    "galleryUrls" TEXT[],
    "description" TEXT NOT NULL,
    "developer" TEXT NOT NULL,
    "propertyValue" DECIMAL(20,2) NOT NULL,
    "holdPeriod" TEXT NOT NULL,
    "bedroomCount" INTEGER,
    "areaSqm" INTEGER,
    "pricePerUnit" DECIMAL(20,6) NOT NULL,
    "totalUnits" INTEGER NOT NULL,
    "unitsAvailable" INTEGER NOT NULL,
    "roiAnnualPct" DECIMAL(6,2) NOT NULL,
    "minInvestmentUsd" DECIMAL(20,2) NOT NULL,
    "minInvestmentUnits" INTEGER NOT NULL,
    "tradeVolumeUsd" DECIMAL(20,2),
    "status" "PropertyStatus" NOT NULL DEFAULT 'Active',
    "documentsUrls" TEXT[],
    "financials" JSONB,
    "tokenIssuerAddress" TEXT NOT NULL,
    "tokenCode" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "properties_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "holdings" (
    "userId" UUID NOT NULL,
    "propertyId" UUID NOT NULL,
    "unitsOwned" INTEGER NOT NULL,
    "averageCostPerUnit" DECIMAL(20,6) NOT NULL,
    "acquiredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "holdings_pkey" PRIMARY KEY ("userId","propertyId")
);

-- CreateTable
CREATE TABLE "orders" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "propertyId" UUID NOT NULL,
    "side" "OrderSide" NOT NULL,
    "type" "OrderType" NOT NULL,
    "units" INTEGER NOT NULL,
    "pricePerUnit" DECIMAL(20,6),
    "settlementAsset" "Asset" NOT NULL,
    "totalAmount" DECIMAL(20,6) NOT NULL,
    "status" "OrderStatus" NOT NULL DEFAULT 'Open',
    "filledUnits" INTEGER NOT NULL DEFAULT 0,
    "averageFillPrice" DECIMAL(20,6),
    "xrplTxHashes" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "filledAt" TIMESTAMP(3),

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "trades" (
    "id" UUID NOT NULL,
    "propertyId" UUID NOT NULL,
    "buyOrderId" UUID NOT NULL,
    "sellOrderId" UUID NOT NULL,
    "buyerUserId" UUID NOT NULL,
    "sellerUserId" UUID NOT NULL,
    "units" INTEGER NOT NULL,
    "pricePerUnit" DECIMAL(20,6) NOT NULL,
    "settlementAsset" "Asset" NOT NULL,
    "xrplTxHash" TEXT NOT NULL,
    "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "trades_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "primary_purchases" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "propertyId" UUID NOT NULL,
    "units" INTEGER NOT NULL,
    "pricePerUnit" DECIMAL(20,6) NOT NULL,
    "totalAmount" DECIMAL(20,6) NOT NULL,
    "settlementAsset" "Asset" NOT NULL,
    "status" "PurchaseStatus" NOT NULL DEFAULT 'Pending',
    "xrplTxHash" TEXT,
    "agreementSignedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "primary_purchases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "withdrawals" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "asset" "Asset" NOT NULL,
    "amount" DECIMAL(20,6) NOT NULL,
    "destinationAddress" TEXT NOT NULL,
    "destinationTag" INTEGER,
    "status" "WithdrawalStatus" NOT NULL DEFAULT 'Pending',
    "xrplTxHash" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "confirmedAt" TIMESTAMP(3),

    CONSTRAINT "withdrawals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "yield_distributions" (
    "id" UUID NOT NULL,
    "propertyId" UUID NOT NULL,
    "periodStart" DATE NOT NULL,
    "periodEnd" DATE NOT NULL,
    "totalAmount" DECIMAL(20,6) NOT NULL,
    "settlementAsset" "Asset" NOT NULL DEFAULT 'RLUSD',
    "distributedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "yield_distributions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "yield_payouts" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "propertyId" UUID NOT NULL,
    "distributionId" UUID NOT NULL,
    "units" INTEGER NOT NULL,
    "amount" DECIMAL(20,6) NOT NULL,
    "xrplTxHash" TEXT NOT NULL,

    CONSTRAINT "yield_payouts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_xrpAddress_key" ON "users"("xrpAddress");

-- CreateIndex
CREATE UNIQUE INDEX "users_privyUserId_key" ON "users"("privyUserId");

-- CreateIndex
CREATE INDEX "properties_status_idx" ON "properties"("status");

-- CreateIndex
CREATE INDEX "holdings_userId_idx" ON "holdings"("userId");

-- CreateIndex
CREATE INDEX "holdings_propertyId_idx" ON "holdings"("propertyId");

-- CreateIndex
CREATE INDEX "orders_userId_status_idx" ON "orders"("userId", "status");

-- CreateIndex
CREATE INDEX "orders_propertyId_status_idx" ON "orders"("propertyId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "trades_xrplTxHash_key" ON "trades"("xrplTxHash");

-- CreateIndex
CREATE INDEX "trades_propertyId_occurredAt_idx" ON "trades"("propertyId", "occurredAt");

-- CreateIndex
CREATE INDEX "primary_purchases_userId_idx" ON "primary_purchases"("userId");

-- CreateIndex
CREATE INDEX "withdrawals_userId_createdAt_idx" ON "withdrawals"("userId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "yield_distributions_propertyId_periodStart_key" ON "yield_distributions"("propertyId", "periodStart");

-- CreateIndex
CREATE INDEX "yield_payouts_userId_idx" ON "yield_payouts"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "yield_payouts_distributionId_userId_key" ON "yield_payouts"("distributionId", "userId");

-- AddForeignKey
ALTER TABLE "holdings" ADD CONSTRAINT "holdings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "holdings" ADD CONSTRAINT "holdings_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trades" ADD CONSTRAINT "trades_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trades" ADD CONSTRAINT "trades_buyOrderId_fkey" FOREIGN KEY ("buyOrderId") REFERENCES "orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trades" ADD CONSTRAINT "trades_sellOrderId_fkey" FOREIGN KEY ("sellOrderId") REFERENCES "orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trades" ADD CONSTRAINT "trades_buyerUserId_fkey" FOREIGN KEY ("buyerUserId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trades" ADD CONSTRAINT "trades_sellerUserId_fkey" FOREIGN KEY ("sellerUserId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "primary_purchases" ADD CONSTRAINT "primary_purchases_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "primary_purchases" ADD CONSTRAINT "primary_purchases_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "withdrawals" ADD CONSTRAINT "withdrawals_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "yield_distributions" ADD CONSTRAINT "yield_distributions_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "yield_payouts" ADD CONSTRAINT "yield_payouts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "yield_payouts" ADD CONSTRAINT "yield_payouts_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "yield_payouts" ADD CONSTRAINT "yield_payouts_distributionId_fkey" FOREIGN KEY ("distributionId") REFERENCES "yield_distributions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

