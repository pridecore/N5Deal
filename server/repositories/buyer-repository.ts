import { AssetCategory, DealType, Prisma } from "@prisma/client";
import { db } from "@/server/db";

export function findBuyerProfile(userId: string) { return db.buyerProfile.findUnique({ where: { userId }, include: { categories: true, countries: true, dealTypes: true } }); }

export function upsertBuyerProfile(userId: string, input: {
  fullName: string; companyName: string; investmentThesis: string;
  investmentMin: Prisma.Decimal | null; investmentMax: Prisma.Decimal | null;
  revenueMin: Prisma.Decimal | null; revenueMax: Prisma.Decimal | null;
  ebitdaMin: Prisma.Decimal | null; ebitdaMax: Prisma.Decimal | null;
  categories: AssetCategory[]; countries: string[]; dealTypes: DealType[];
}) {
  return db.$transaction(async (tx) => {
    const profile = await tx.buyerProfile.upsert({ where: { userId }, update: {
      fullName: input.fullName, companyName: input.companyName, investmentThesis: input.investmentThesis,
      investmentMin: input.investmentMin, investmentMax: input.investmentMax, revenueMin: input.revenueMin,
      revenueMax: input.revenueMax, ebitdaMin: input.ebitdaMin, ebitdaMax: input.ebitdaMax,
    }, create: { userId, fullName: input.fullName, companyName: input.companyName, investmentThesis: input.investmentThesis,
      investmentMin: input.investmentMin, investmentMax: input.investmentMax, revenueMin: input.revenueMin,
      revenueMax: input.revenueMax, ebitdaMin: input.ebitdaMin, ebitdaMax: input.ebitdaMax } });
    await Promise.all([
      tx.buyerCategory.deleteMany({ where: { buyerId: profile.id } }), tx.buyerCountry.deleteMany({ where: { buyerId: profile.id } }), tx.buyerDealType.deleteMany({ where: { buyerId: profile.id } }),
    ]);
    await Promise.all([
      tx.buyerCategory.createMany({ data: input.categories.map((category) => ({ buyerId: profile.id, category })) }),
      tx.buyerCountry.createMany({ data: input.countries.map((country) => ({ buyerId: profile.id, country })) }),
      tx.buyerDealType.createMany({ data: input.dealTypes.map((dealType) => ({ buyerId: profile.id, dealType })) }),
    ]);
    return tx.buyerProfile.findUniqueOrThrow({ where: { id: profile.id }, include: { categories: true, countries: true, dealTypes: true } });
  });
}
