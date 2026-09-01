import { describe, expect, it } from "vitest";
import { AssetStatus } from "@prisma/client";
import { buildAssetWhere } from "@/server/repositories/asset-repository";
import { canTransitionAsset } from "@/server/services/asset-service";
import { assertOwnership } from "@/server/auth/guards";
import { assetQuerySchema } from "@/validation/assets";
import { buyerProfileSchema } from "@/validation/buyer";

describe("marketplace validation and policy", () => {
  it("validates bounded filters and pagination", () => {
    expect(assetQuerySchema.safeParse({ page: 2, pageSize: 12, minPrice: "1000000", maxPrice: "5000000", sort: "price-desc" }).success).toBe(true);
    expect(assetQuerySchema.safeParse({ pageSize: 51 }).success).toBe(false);
    expect(assetQuerySchema.safeParse({ minPrice: "5000000", maxPrice: "1000000" }).success).toBe(false);
  });

  it("builds database-side search and price predicates", () => {
    const where = buildAssetWhere({ search: "bank", minPrice: "1000000", maxPrice: "5000000", sort: "newest", page: 1, pageSize: 12 });
    expect(where.OR).toHaveLength(3);
    expect(where.askingPrice).toEqual({ gte: expect.anything(), lte: expect.anything() });
    expect(where.status).toBe(AssetStatus.PUBLISHED);
  });

  it("centralizes the permitted lifecycle transitions", () => {
    expect(canTransitionAsset(AssetStatus.DRAFT, AssetStatus.PUBLISHED)).toBe(true);
    expect(canTransitionAsset(AssetStatus.PUBLISHED, AssetStatus.ARCHIVED)).toBe(true);
    expect(canTransitionAsset(AssetStatus.SUSPENDED, AssetStatus.PUBLISHED)).toBe(false);
    expect(canTransitionAsset(AssetStatus.DRAFT, AssetStatus.ARCHIVED)).toBe(false);
  });

  it("rejects cross-owner access", () => {
    expect(() => assertOwnership("seller-a", "seller-b")).toThrow();
    expect(() => assertOwnership("seller-a", "seller-a")).not.toThrow();
  });

  it("validates buyer ranges and required target dimensions", () => {
    const valid = { fullName: "Maya Chen", companyName: "Northline Capital", investmentThesis: "Backing resilient financial infrastructure businesses.", investmentMin: "1000000", investmentMax: "5000000", revenueMin: "", revenueMax: "", ebitdaMin: "", ebitdaMax: "", categories: ["FINTECH"], countries: ["Germany"], dealTypes: ["FULL_ACQUISITION"] };
    expect(buyerProfileSchema.safeParse(valid).success).toBe(true);
    expect(buyerProfileSchema.safeParse({ ...valid, investmentMin: "6000000", investmentMax: "5000000" }).success).toBe(false);
    expect(buyerProfileSchema.safeParse({ ...valid, categories: [] }).success).toBe(false);
  });
});
