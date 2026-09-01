import { AssetCategory, AssetStatus, DealType, Prisma } from "@prisma/client";
import { db } from "@/server/db";
import type { AssetQueryInput, CreateAssetInput } from "@/validation/assets";
import { toDecimal } from "@/lib/decimal";

const assetCardSelect = {
  id: true, slug: true, title: true, category: true, country: true, description: true,
  askingPrice: true, currency: true, revenue: true, ebitda: true, dealType: true,
  businessStatus: true, status: true, createdAt: true, updatedAt: true,
} satisfies Prisma.AssetSelect;

export function buildAssetWhere(input: AssetQueryInput): Prisma.AssetWhereInput {
  const askingPrice: { gte?: Prisma.Decimal; lte?: Prisma.Decimal } = {};
  if (input.minPrice && input.minPrice !== "") askingPrice.gte = toDecimal(input.minPrice) as Prisma.Decimal;
  if (input.maxPrice && input.maxPrice !== "") askingPrice.lte = toDecimal(input.maxPrice) as Prisma.Decimal;
  return {
    status: AssetStatus.PUBLISHED,
    seller: { user: { status: "ACTIVE" } },
    ...(input.search ? { OR: [
      { title: { contains: input.search, mode: "insensitive" } },
      { description: { contains: input.search, mode: "insensitive" } },
      { country: { contains: input.search, mode: "insensitive" } },
    ] } : {}),
    ...(input.category ? { category: input.category as AssetCategory } : {}),
    ...(input.country ? { country: { contains: input.country, mode: "insensitive" } } : {}),
    ...(input.dealType ? { dealType: input.dealType as DealType } : {}),
    ...(input.businessStatus ? { businessStatus: { equals: input.businessStatus, mode: "insensitive" } } : {}),
    ...(Object.keys(askingPrice).length > 0 ? { askingPrice } : {}),
  };
}

export function listPublishedAssets(input: AssetQueryInput) {
  const where = buildAssetWhere(input);
  const orderBy = input.sort === "price-asc" ? { askingPrice: "asc" as const } : input.sort === "price-desc" ? { askingPrice: "desc" as const } : input.sort === "oldest" ? { createdAt: "asc" as const } : { createdAt: "desc" as const };
  return Promise.all([
    db.asset.findMany({ where, select: assetCardSelect, orderBy, skip: (input.page - 1) * input.pageSize, take: input.pageSize }),
    db.asset.count({ where }),
  ]);
}

export async function listPublishedAssetsForMatching(input: AssetQueryInput) {
  const where = buildAssetWhere(input);
  return db.asset.findMany({ where, select: assetCardSelect, orderBy: { createdAt: "desc" }, take: 200 });
}

export function findAssetBySlug(slug: string) {
  return db.asset.findUnique({ where: { slug }, include: { seller: { include: { user: { select: { status: true } } } } } });
}

export function findAssetById(id: string) {
  return db.asset.findUnique({ where: { id }, include: { seller: { include: { user: { select: { status: true } } } } } });
}

export function findAssetForOwner(id: string, userId: string) {
  return db.asset.findFirst({ where: { id, seller: { userId } }, include: { seller: true } });
}

export function listSellerAssets(userId: string) {
  return db.asset.findMany({ where: { seller: { userId } }, orderBy: { updatedAt: "desc" }, select: assetCardSelect });
}

function financialData(input: CreateAssetInput) {
  return { askingPrice: toDecimal(input.askingPrice) as Prisma.Decimal, revenue: toDecimal(input.revenue), ebitda: toDecimal(input.ebitda) };
}

export function createAsset(sellerUserId: string, input: CreateAssetInput, slug: string) {
  return db.asset.create({ data: {
    title: input.title, category: input.category, country: input.country, description: input.description,
    currency: input.currency, dealType: input.dealType, businessStatus: input.businessStatus, slug,
    ...financialData(input), seller: { connect: { userId: sellerUserId } },
  } });
}

export function updateOwnedAsset(id: string, userId: string, input: CreateAssetInput) {
  return db.asset.updateMany({ where: { id, seller: { userId }, NOT: { status: AssetStatus.SUSPENDED } }, data: {
    title: input.title, category: input.category, country: input.country, description: input.description,
    currency: input.currency, dealType: input.dealType, businessStatus: input.businessStatus, ...financialData(input),
  } });
}

export function updateAssetStatus(id: string, userId: string, status: AssetStatus) {
  return db.asset.updateMany({ where: { id, seller: { userId }, NOT: { status: AssetStatus.SUSPENDED } }, data: { status } });
}
