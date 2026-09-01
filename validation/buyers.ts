import { z } from "zod";
import { assetCategories, dealTypes } from "@/validation/assets";

export const buyerDiscoveryQuerySchema = z.object({
  search: z.string().trim().max(100).optional(),
  category: z.enum(assetCategories).optional(),
  country: z.string().trim().max(80).optional(),
  dealType: z.enum(dealTypes).optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(12),
});

export type BuyerDiscoveryQueryInput = z.infer<typeof buyerDiscoveryQuerySchema>;
