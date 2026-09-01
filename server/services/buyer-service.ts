import { AssetCategory, DealType } from "@prisma/client";
import { decimalToString, toDecimal } from "@/lib/decimal";
import { AppError } from "@/server/errors";
import { findBuyerProfile, upsertBuyerProfile } from "@/server/repositories/buyer-repository";
import type { BuyerProfileInput } from "@/validation/buyer";

export async function getBuyerProfile(userId: string) {
  const profile = await findBuyerProfile(userId);
  if (!profile) throw new AppError("Buyer profile not found.", 404, "NOT_FOUND");
  return {
    ...profile,
    investmentMin: decimalToString(profile.investmentMin), investmentMax: decimalToString(profile.investmentMax),
    revenueMin: decimalToString(profile.revenueMin), revenueMax: decimalToString(profile.revenueMax),
    ebitdaMin: decimalToString(profile.ebitdaMin), ebitdaMax: decimalToString(profile.ebitdaMax),
  };
}

export async function saveBuyerProfile(userId: string, input: BuyerProfileInput) {
  const profile = await upsertBuyerProfile(userId, {
    ...input,
    investmentMin: toDecimal(input.investmentMin), investmentMax: toDecimal(input.investmentMax),
    revenueMin: toDecimal(input.revenueMin), revenueMax: toDecimal(input.revenueMax),
    ebitdaMin: toDecimal(input.ebitdaMin), ebitdaMax: toDecimal(input.ebitdaMax),
    categories: input.categories as AssetCategory[], dealTypes: input.dealTypes as DealType[],
  });
  return {
    ...profile,
    investmentMin: decimalToString(profile.investmentMin), investmentMax: decimalToString(profile.investmentMax),
    revenueMin: decimalToString(profile.revenueMin), revenueMax: decimalToString(profile.revenueMax),
    ebitdaMin: decimalToString(profile.ebitdaMin), ebitdaMax: decimalToString(profile.ebitdaMax),
  };
}
