CREATE SCHEMA IF NOT EXISTS "public";

CREATE TYPE "UserRole" AS ENUM ('BUYER', 'SELLER', 'MANAGER');
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'SUSPENDED');
CREATE TYPE "AssetStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'SUSPENDED', 'ARCHIVED');
CREATE TYPE "AssetCategory" AS ENUM ('BANK', 'FINTECH', 'PAYMENT', 'EMI', 'CRYPTO', 'OTHER');
CREATE TYPE "DealType" AS ENUM ('FULL_ACQUISITION', 'MAJORITY_STAKE', 'MINORITY_STAKE', 'ASSET_SALE', 'MERGER');
CREATE TYPE "ContactRequestStatus" AS ENUM ('PENDING', 'ACCEPTED', 'DECLINED', 'CLOSED');

CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "BuyerProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "investmentMin" DECIMAL(18,2), "investmentMax" DECIMAL(18,2),
    "revenueMin" DECIMAL(18,2), "revenueMax" DECIMAL(18,2),
    "ebitdaMin" DECIMAL(18,2), "ebitdaMax" DECIMAL(18,2),
    "investmentThesis" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "BuyerProfile_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "BuyerCategory" ("buyerId" TEXT NOT NULL, "category" "AssetCategory" NOT NULL, CONSTRAINT "BuyerCategory_pkey" PRIMARY KEY ("buyerId", "category"));
CREATE TABLE "BuyerCountry" ("buyerId" TEXT NOT NULL, "country" TEXT NOT NULL, CONSTRAINT "BuyerCountry_pkey" PRIMARY KEY ("buyerId", "country"));
CREATE TABLE "BuyerDealType" ("buyerId" TEXT NOT NULL, "dealType" "DealType" NOT NULL, CONSTRAINT "BuyerDealType_pkey" PRIMARY KEY ("buyerId", "dealType"));
CREATE TABLE "SellerProfile" (
    "id" TEXT NOT NULL, "userId" TEXT NOT NULL, "fullName" TEXT NOT NULL,
    "companyName" TEXT NOT NULL, "bio" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "SellerProfile_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "Asset" (
    "id" TEXT NOT NULL, "slug" TEXT NOT NULL, "title" TEXT NOT NULL,
    "category" "AssetCategory" NOT NULL, "country" TEXT NOT NULL, "description" TEXT NOT NULL,
    "askingPrice" DECIMAL(18,2) NOT NULL, "currency" CHAR(3) NOT NULL,
    "revenue" DECIMAL(18,2), "ebitda" DECIMAL(18,2), "dealType" "DealType" NOT NULL,
    "businessStatus" TEXT NOT NULL, "status" "AssetStatus" NOT NULL DEFAULT 'DRAFT',
    "sellerId" TEXT NOT NULL, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Asset_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "ContactRequest" (
    "id" TEXT NOT NULL, "buyerId" TEXT NOT NULL, "sellerId" TEXT NOT NULL, "assetId" TEXT,
    "message" TEXT NOT NULL, "status" "ContactRequestStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "ContactRequest_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE INDEX "User_role_status_idx" ON "User"("role", "status");
CREATE INDEX "User_status_idx" ON "User"("status");
CREATE UNIQUE INDEX "Session_tokenHash_key" ON "Session"("tokenHash");
CREATE INDEX "Session_userId_idx" ON "Session"("userId");
CREATE INDEX "Session_expiresAt_idx" ON "Session"("expiresAt");
CREATE UNIQUE INDEX "BuyerProfile_userId_key" ON "BuyerProfile"("userId");
CREATE INDEX "BuyerCategory_category_idx" ON "BuyerCategory"("category");
CREATE INDEX "BuyerCountry_country_idx" ON "BuyerCountry"("country");
CREATE INDEX "BuyerDealType_dealType_idx" ON "BuyerDealType"("dealType");
CREATE UNIQUE INDEX "SellerProfile_userId_key" ON "SellerProfile"("userId");
CREATE UNIQUE INDEX "Asset_slug_key" ON "Asset"("slug");
CREATE INDEX "Asset_status_category_country_idx" ON "Asset"("status", "category", "country");
CREATE INDEX "Asset_sellerId_status_idx" ON "Asset"("sellerId", "status");
CREATE INDEX "Asset_askingPrice_idx" ON "Asset"("askingPrice");
CREATE INDEX "Asset_createdAt_idx" ON "Asset"("createdAt");
CREATE INDEX "ContactRequest_buyerId_status_idx" ON "ContactRequest"("buyerId", "status");
CREATE INDEX "ContactRequest_sellerId_status_idx" ON "ContactRequest"("sellerId", "status");
CREATE INDEX "ContactRequest_assetId_idx" ON "ContactRequest"("assetId");

ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "BuyerProfile" ADD CONSTRAINT "BuyerProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "BuyerCategory" ADD CONSTRAINT "BuyerCategory_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "BuyerProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "BuyerCountry" ADD CONSTRAINT "BuyerCountry_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "BuyerProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "BuyerDealType" ADD CONSTRAINT "BuyerDealType_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "BuyerProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SellerProfile" ADD CONSTRAINT "SellerProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Asset" ADD CONSTRAINT "Asset_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "SellerProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ContactRequest" ADD CONSTRAINT "ContactRequest_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ContactRequest" ADD CONSTRAINT "ContactRequest_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ContactRequest" ADD CONSTRAINT "ContactRequest_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset"("id") ON DELETE SET NULL ON UPDATE CASCADE;
