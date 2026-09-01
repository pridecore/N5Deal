import { UserStatus } from "@prisma/client";
import { decimalToString } from "@/lib/decimal";
import { db } from "@/server/db";
import { scoreAssetForBuyer } from "@/server/services/match-service";
import type { BuyerDiscoveryQueryInput } from "@/validation/buyers";

export async function listDiscoverableBuyers(input: BuyerDiscoveryQueryInput, sellerUserId: string) {
  const where = {
    user: { status: UserStatus.ACTIVE },
    ...(input.search ? { OR: [
      { fullName: { contains: input.search, mode: "insensitive" as const } },
      { companyName: { contains: input.search, mode: "insensitive" as const } },
      { investmentThesis: { contains: input.search, mode: "insensitive" as const } },
    ] } : {}),
    ...(input.category ? { categories: { some: { category: input.category } } } : {}),
    ...(input.country ? { countries: { some: { country: { contains: input.country, mode: "insensitive" as const } } } } : {}),
    ...(input.dealType ? { dealTypes: { some: { dealType: input.dealType } } } : {}),
  };

  const [buyers, total, sellerAssets] = await Promise.all([
    db.buyerProfile.findMany({
      where,
      include: { user: { select: { id: true, status: true } }, categories: true, countries: true, dealTypes: true },
      orderBy: { updatedAt: "desc" },
      skip: (input.page - 1) * input.pageSize,
      take: input.pageSize,
    }),
    db.buyerProfile.count({ where }),
    db.asset.findMany({ where: { seller: { userId: sellerUserId } }, orderBy: { updatedAt: "desc" }, take: 20 }),
  ]);

  return {
    items: buyers.map((buyer) => {
      const best = sellerAssets.map((asset) => ({ assetId: asset.id, title: asset.title, match: scoreAssetForBuyer(asset, buyer) })).sort((a, b) => (b.match?.score ?? 0) - (a.match?.score ?? 0))[0] ?? null;
      return {
        id: buyer.userId,
        fullName: buyer.fullName,
        companyName: buyer.companyName,
        investmentThesis: buyer.investmentThesis,
        investmentMin: decimalToString(buyer.investmentMin),
        investmentMax: decimalToString(buyer.investmentMax),
        revenueMin: decimalToString(buyer.revenueMin),
        revenueMax: decimalToString(buyer.revenueMax),
        ebitdaMin: decimalToString(buyer.ebitdaMin),
        ebitdaMax: decimalToString(buyer.ebitdaMax),
        categories: buyer.categories,
        countries: buyer.countries,
        dealTypes: buyer.dealTypes,
        bestSellerAssetMatch: best,
      };
    }),
    pagination: { page: input.page, pageSize: input.pageSize, total, pageCount: Math.ceil(total / input.pageSize) },
  };
}

export async function getDiscoverableBuyer(id: string, sellerUserId: string) {
  const buyer = await db.buyerProfile.findUnique({
    where: { userId: id },
    include: { user: { select: { id: true, status: true } }, categories: true, countries: true, dealTypes: true },
  });
  if (!buyer || buyer.user.status !== UserStatus.ACTIVE) return null;
  const sellerAssets = await db.asset.findMany({ where: { seller: { userId: sellerUserId } }, orderBy: { updatedAt: "desc" }, take: 20 });
  const best = sellerAssets.map((asset) => ({ assetId: asset.id, title: asset.title, match: scoreAssetForBuyer(asset, buyer) })).sort((a, b) => (b.match?.score ?? 0) - (a.match?.score ?? 0))[0] ?? null;
  return {
    id: buyer.userId,
    fullName: buyer.fullName,
    companyName: buyer.companyName,
    investmentThesis: buyer.investmentThesis,
    investmentMin: decimalToString(buyer.investmentMin),
    investmentMax: decimalToString(buyer.investmentMax),
    revenueMin: decimalToString(buyer.revenueMin),
    revenueMax: decimalToString(buyer.revenueMax),
    ebitdaMin: decimalToString(buyer.ebitdaMin),
    ebitdaMax: decimalToString(buyer.ebitdaMax),
    categories: buyer.categories,
    countries: buyer.countries,
    dealTypes: buyer.dealTypes,
    bestSellerAssetMatch: best,
  };
}
