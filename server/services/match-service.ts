import { AssetCategory, DealType, Prisma } from "@prisma/client";
import { decimalToNumber } from "@/lib/decimal";
import { db } from "@/server/db";

type Preference = {
  investmentMin: Prisma.Decimal | null;
  investmentMax: Prisma.Decimal | null;
  revenueMin: Prisma.Decimal | null;
  revenueMax: Prisma.Decimal | null;
  ebitdaMin: Prisma.Decimal | null;
  ebitdaMax: Prisma.Decimal | null;
  categories: { category: AssetCategory }[];
  countries: { country: string }[];
  dealTypes: { dealType: DealType }[];
};

type MatchAsset = {
  category: AssetCategory;
  country: string;
  askingPrice: Prisma.Decimal;
  revenue: Prisma.Decimal | null;
  ebitda: Prisma.Decimal | null;
  dealType: DealType;
  businessStatus: string;
};

export type MatchResult = {
  score: number;
  level: "Strong" | "Good" | "Weak";
  reasons: string[];
  mismatches: string[];
};

function inRange(value: Prisma.Decimal | null, min: Prisma.Decimal | null, max: Prisma.Decimal | null): "match" | "missing" | "mismatch" {
  if (!value || (!min && !max)) return "missing";
  if (min && value.lessThan(min)) return "mismatch";
  if (max && value.greaterThan(max)) return "mismatch";
  return "match";
}

function countryMatches(assetCountry: string, targets: string[]): boolean {
  return targets.some((target) => assetCountry.toLowerCase().includes(target.toLowerCase()) || target.toLowerCase().includes(assetCountry.toLowerCase()));
}

export function scoreAssetForBuyer(asset: MatchAsset, preference: Preference | null): MatchResult | null {
  if (!preference) return null;

  let points = 0;
  const reasons: string[] = [];
  const mismatches: string[] = [];
  const categories = preference.categories.map((item) => item.category);
  const countries = preference.countries.map((item) => item.country);
  const dealTypes = preference.dealTypes.map((item) => item.dealType);

  if (categories.includes(asset.category)) { points += 22; reasons.push(`${asset.category} matches target categories.`); }
  else mismatches.push(`${asset.category} is outside target categories.`);

  if (countryMatches(asset.country, countries)) { points += 18; reasons.push(`${asset.country} matches preferred geography.`); }
  else mismatches.push(`${asset.country} is outside preferred geographies.`);

  const investment = inRange(asset.askingPrice, preference.investmentMin, preference.investmentMax);
  if (investment === "match") { points += 22; reasons.push(`Asking price ${decimalToNumber(asset.askingPrice)?.toLocaleString("en-US")} fits the investment range.`); }
  else if (investment === "mismatch") mismatches.push("Asking price is outside the investment range.");

  const revenue = inRange(asset.revenue, preference.revenueMin, preference.revenueMax);
  if (revenue === "match") { points += 12; reasons.push("Revenue fits the preferred range."); }
  else if (revenue === "mismatch") mismatches.push("Revenue is outside the preferred range.");

  const ebitda = inRange(asset.ebitda, preference.ebitdaMin, preference.ebitdaMax);
  if (ebitda === "match") { points += 12; reasons.push("EBITDA fits the preferred range."); }
  else if (ebitda === "mismatch") mismatches.push("EBITDA is outside the preferred range.");

  if (dealTypes.includes(asset.dealType)) { points += 14; reasons.push(`${asset.dealType.replaceAll("_", " ")} matches preferred deal types.`); }
  else mismatches.push(`${asset.dealType.replaceAll("_", " ")} is not a preferred deal type.`);

  const score = Math.max(0, Math.min(100, Math.round(points)));
  return { score, level: score >= 80 ? "Strong" : score >= 55 ? "Good" : "Weak", reasons, mismatches };
}

export async function getBuyerPreference(userId: string) {
  return db.buyerProfile.findUnique({
    where: { userId },
    include: { categories: true, countries: true, dealTypes: true },
  });
}

export async function getAssetMatch(assetId: string, buyerUserId: string) {
  const [asset, preference] = await Promise.all([
    db.asset.findFirst({ where: { id: assetId, status: "PUBLISHED", seller: { user: { status: "ACTIVE" } } } }),
    getBuyerPreference(buyerUserId),
  ]);
  if (!asset) return null;
  return scoreAssetForBuyer(asset, preference);
}
