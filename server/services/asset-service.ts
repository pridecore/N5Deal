import { AssetStatus, Prisma } from "@prisma/client";
import { decimalToString } from "@/lib/decimal";
import { AppError } from "@/server/errors";
import { assertOwnership } from "@/server/auth/guards";
import { createAsset, findAssetById, findAssetBySlug, findAssetForOwner, listPublishedAssets, listPublishedAssetsForMatching, listSellerAssets, updateAssetStatus, updateOwnedAsset } from "@/server/repositories/asset-repository";
import { getBuyerPreference, scoreAssetForBuyer } from "@/server/services/match-service";
import { recordAuditEvent } from "@/server/services/audit-service";
import type { AssetQueryInput, CreateAssetInput } from "@/validation/assets";

const transitions: Record<AssetStatus, readonly AssetStatus[]> = {
  DRAFT: [AssetStatus.PUBLISHED],
  PUBLISHED: [AssetStatus.ARCHIVED],
  ARCHIVED: [AssetStatus.DRAFT, AssetStatus.PUBLISHED],
  SUSPENDED: [],
};

export function canTransitionAsset(from: AssetStatus, to: AssetStatus): boolean { return transitions[from].includes(to); }

function serializeAsset<T extends {
  askingPrice: Prisma.Decimal; revenue: Prisma.Decimal | null; ebitda: Prisma.Decimal | null;
}>(asset: T): Omit<T, "askingPrice" | "revenue" | "ebitda"> & { askingPrice: string | null; revenue: string | null; ebitda: string | null } {
  const serialized = { ...asset, askingPrice: decimalToString(asset.askingPrice), revenue: decimalToString(asset.revenue), ebitda: decimalToString(asset.ebitda) } as Omit<T, "askingPrice" | "revenue" | "ebitda"> & { askingPrice: string | null; revenue: string | null; ebitda: string | null };
  if ("seller" in serialized && serialized.seller && typeof serialized.seller === "object") {
    const seller = serialized.seller as { companyName?: string; fullName?: string; bio?: string };
    return { ...serialized, seller: { companyName: seller.companyName, fullName: seller.fullName, bio: seller.bio } } as typeof serialized;
  }
  return serialized;
}

export async function getPublishedAssets(input: AssetQueryInput, viewer?: { id: string; role: string }) {
  if (input.sort === "best-match" && viewer?.role === "BUYER") {
    const preference = await getBuyerPreference(viewer.id);
    const candidates = await listPublishedAssetsForMatching(input);
    const ranked = candidates
      .map((asset) => ({ asset, match: scoreAssetForBuyer(asset, preference) }))
      .sort((a, b) => (b.match?.score ?? -1) - (a.match?.score ?? -1));
    const start = (input.page - 1) * input.pageSize;
    return {
      items: ranked.slice(start, start + input.pageSize).map(({ asset, match }) => ({ ...serializeAsset(asset), match })),
      pagination: { page: input.page, pageSize: input.pageSize, total: ranked.length, pageCount: Math.ceil(ranked.length / input.pageSize) },
    };
  }
  const [items, total] = await listPublishedAssets(input);
  const preference = viewer?.role === "BUYER" ? await getBuyerPreference(viewer.id) : null;
  return {
    items: items.map((asset) => ({ ...serializeAsset(asset), match: scoreAssetForBuyer(asset, preference) })),
    pagination: { page: input.page, pageSize: input.pageSize, total, pageCount: Math.ceil(total / input.pageSize) },
  };
}

export async function getAssetDetails(slug: string, viewer: { id: string; role: string }) {
  const asset = await findAssetBySlug(slug) ?? await findAssetById(slug);
  if (!asset) throw new AppError("Asset not found.", 404, "NOT_FOUND");
  const isOwner = viewer.role === "SELLER" && asset.seller.userId === viewer.id;
  const isPublic = asset.status === AssetStatus.PUBLISHED && asset.seller.user.status === "ACTIVE";
  if (!isOwner && !isPublic) throw new AppError("Asset not found.", 404, "NOT_FOUND");
  const preference = viewer.role === "BUYER" ? await getBuyerPreference(viewer.id) : null;
  return { ...serializeAsset(asset), match: scoreAssetForBuyer(asset, preference) };
}

export async function getSellerAssets(userId: string) { return (await listSellerAssets(userId)).map(serializeAsset); }

function slugify(value: string): string { return value.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""); }

export async function createSellerAsset(sellerId: string, input: CreateAssetInput) {
  const asset = await createAsset(sellerId, input, `${slugify(input.title)}-${Date.now().toString(36)}`);
  await recordAuditEvent({ actorUserId: sellerId, action: "ASSET_CREATED", entityType: "asset", entityId: asset.id, metadata: { title: asset.title, status: asset.status } });
  return serializeAsset(asset);
}

export async function editSellerAsset(id: string, sellerId: string, input: CreateAssetInput) {
  const existing = await findAssetForOwner(id, sellerId);
  if (!existing) throw new AppError("Asset not found.", 404, "NOT_FOUND");
  if (existing.status === AssetStatus.SUSPENDED) throw new AppError("Suspended assets cannot be edited by sellers.", 403, "FORBIDDEN");
  const result = await updateOwnedAsset(id, sellerId, input);
  if (result.count !== 1) throw new AppError("Asset could not be updated.", 409, "CONFLICT");
  await recordAuditEvent({ actorUserId: sellerId, action: "ASSET_EDITED", entityType: "asset", entityId: id, metadata: { title: input.title } });
  return serializeAsset((await findAssetForOwner(id, sellerId))!);
}

export async function transitionSellerAsset(id: string, sellerId: string, target: AssetStatus) {
  const existing = await findAssetForOwner(id, sellerId);
  if (!existing) throw new AppError("Asset not found.", 404, "NOT_FOUND");
  assertOwnership(existing.seller.userId, sellerId);
  if (!canTransitionAsset(existing.status, target)) throw new AppError(`Cannot move an ${existing.status.toLowerCase()} asset to ${target.toLowerCase()}.`, 409, "INVALID_TRANSITION");
  const result = await updateAssetStatus(id, sellerId, target);
  if (result.count !== 1) throw new AppError("Asset status could not be updated.", 409, "CONFLICT");
  await recordAuditEvent({ actorUserId: sellerId, action: target === AssetStatus.PUBLISHED ? "ASSET_PUBLISHED" : "ASSET_ARCHIVED", entityType: "asset", entityId: id, metadata: { from: existing.status, to: target } });
  return serializeAsset((await findAssetForOwner(id, sellerId))!);
}
