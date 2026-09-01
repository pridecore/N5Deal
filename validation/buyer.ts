import { z } from "zod";
import { assetCategories, dealTypes } from "@/validation/assets";

const optionalDecimalText = z.union([
  z.string().trim().regex(/^\d{1,16}(?:\.\d{1,2})?$/, "Enter a valid non-negative amount."),
  z.literal(""),
]).optional();

export const buyerProfileSchema = z.object({
  fullName: z.string().trim().min(2).max(100),
  companyName: z.string().trim().min(2).max(140),
  investmentThesis: z.string().trim().min(20).max(3000),
  investmentMin: optionalDecimalText,
  investmentMax: optionalDecimalText,
  revenueMin: optionalDecimalText,
  revenueMax: optionalDecimalText,
  ebitdaMin: optionalDecimalText,
  ebitdaMax: optionalDecimalText,
  categories: z.array(z.enum(assetCategories)).min(1, "Choose at least one target category."),
  countries: z.array(z.string().trim().min(2).max(80)).min(1, "Add at least one target geography."),
  dealTypes: z.array(z.enum(dealTypes)).min(1, "Choose at least one preferred deal type."),
}).superRefine((input, ctx) => {
  const pairs: Array<[keyof typeof input, keyof typeof input, string]> = [
    ["investmentMin", "investmentMax", "Minimum investment cannot exceed maximum investment."],
    ["revenueMin", "revenueMax", "Minimum revenue cannot exceed maximum revenue."],
    ["ebitdaMin", "ebitdaMax", "Minimum EBITDA cannot exceed maximum EBITDA."],
  ];
  for (const [minKey, maxKey, message] of pairs) {
    const min = input[minKey]; const max = input[maxKey];
    if (typeof min === "string" && typeof max === "string" && min !== "" && max !== "" && Number(min) > Number(max)) {
      ctx.addIssue({ code: "custom", path: [minKey], message });
    }
  }
});

export type BuyerProfileInput = z.infer<typeof buyerProfileSchema>;
