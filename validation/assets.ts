import { z } from "zod";

export const assetCategories = ["BANK", "FINTECH", "PAYMENT", "EMI", "CRYPTO", "OTHER"] as const;
export const dealTypes = ["FULL_ACQUISITION", "MAJORITY_STAKE", "MINORITY_STAKE", "ASSET_SALE", "MERGER"] as const;
export const assetSorts = ["newest", "oldest", "price-asc", "price-desc", "best-match"] as const;

const decimalText = z.string().trim().regex(/^\d{1,16}(?:\.\d{1,2})?$/, "Enter a valid non-negative amount.");
const optionalDecimalText = z.union([decimalText, z.literal("")]).optional();

export const assetQuerySchema = z.object({
  search: z.string().trim().max(100).optional(),
  category: z.enum(assetCategories).optional(),
  country: z.string().trim().max(80).optional(),
  minPrice: optionalDecimalText,
  maxPrice: optionalDecimalText,
  dealType: z.enum(dealTypes).optional(),
  businessStatus: z.string().trim().max(80).optional(),
  sort: z.enum(assetSorts).default("newest"),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(12),
}).superRefine((input, ctx) => {
  if (input.minPrice && input.maxPrice && input.minPrice !== "" && input.maxPrice !== "" && Number(input.minPrice) > Number(input.maxPrice)) {
    ctx.addIssue({ code: "custom", path: ["minPrice"], message: "Minimum price cannot exceed maximum price." });
  }
});

export const assetInputSchema = z.object({
  title: z.string().trim().min(3).max(140),
  category: z.enum(assetCategories),
  country: z.string().trim().min(2).max(80),
  description: z.string().trim().min(20).max(5000),
  askingPrice: decimalText,
  currency: z.string().trim().length(3).toUpperCase(),
  revenue: optionalDecimalText,
  ebitda: z.union([decimalText, z.literal("")]).optional(),
  dealType: z.enum(dealTypes),
  businessStatus: z.string().trim().min(2).max(80),
});

export const createAssetSchema = assetInputSchema;
export const updateAssetSchema = assetInputSchema;
export type AssetQueryInput = z.infer<typeof assetQuerySchema>;
export type CreateAssetInput = z.infer<typeof assetInputSchema>;
