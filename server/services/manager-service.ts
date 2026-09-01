import { AssetStatus, UserRole, UserStatus } from "@prisma/client";
import { db } from "@/server/db";
import { AppError } from "@/server/errors";
import { decimalToString } from "@/lib/decimal";
import { recordAuditEvent } from "@/server/services/audit-service";
import { logServer } from "@/server/logger";
import type { ManagerAssetQueryInput, ManagerUserQueryInput } from "@/validation/manager";

export async function getManagerMetrics() {
  const [activeBuyers, activeSellers, publishedAssets, suspendedUsers, suspendedAssets, recentActivity] = await Promise.all([
    db.user.count({ where: { role: UserRole.BUYER, status: UserStatus.ACTIVE } }),
    db.user.count({ where: { role: UserRole.SELLER, status: UserStatus.ACTIVE } }),
    db.asset.count({ where: { status: AssetStatus.PUBLISHED } }),
    db.user.count({ where: { status: UserStatus.SUSPENDED } }),
    db.asset.count({ where: { status: AssetStatus.SUSPENDED } }),
    db.auditEvent.count({ where: { createdAt: { gte: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7) } } }),
  ]);
  return { activeBuyers, activeSellers, publishedAssets, suspendedUsers, suspendedAssets, recentActivity };
}

export async function listManagerUsers(input: ManagerUserQueryInput) {
  const where = {
    ...(input.role ? { role: input.role } : {}),
    ...(input.status ? { status: input.status } : {}),
    ...(input.search ? { OR: [
      { email: { contains: input.search, mode: "insensitive" as const } },
      { buyerProfile: { companyName: { contains: input.search, mode: "insensitive" as const } } },
      { sellerProfile: { companyName: { contains: input.search, mode: "insensitive" as const } } },
    ] } : {}),
  };
  const [items, total] = await Promise.all([
    db.user.findMany({
      where,
      select: { id: true, email: true, role: true, status: true, createdAt: true, updatedAt: true, buyerProfile: true, sellerProfile: true },
      orderBy: { createdAt: "desc" },
      skip: (input.page - 1) * input.pageSize,
      take: input.pageSize,
    }),
    db.user.count({ where }),
  ]);
  return { items: items.map((user) => ({
    id: user.id,
    email: user.email,
    role: user.role,
    status: user.status,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    displayName: user.buyerProfile?.fullName ?? user.sellerProfile?.fullName ?? user.email,
    companyName: user.buyerProfile?.companyName ?? user.sellerProfile?.companyName ?? null,
  })), pagination: { page: input.page, pageSize: input.pageSize, total, pageCount: Math.ceil(total / input.pageSize) } };
}

export async function listManagerAssets(input: ManagerAssetQueryInput) {
  const where = {
    ...(input.status ? { status: input.status } : {}),
    ...(input.category ? { category: input.category } : {}),
    ...(input.search ? { OR: [
      { title: { contains: input.search, mode: "insensitive" as const } },
      { country: { contains: input.search, mode: "insensitive" as const } },
      { seller: { companyName: { contains: input.search, mode: "insensitive" as const } } },
    ] } : {}),
  };
  const [items, total] = await Promise.all([
    db.asset.findMany({ where, include: { seller: { include: { user: { select: { id: true, status: true } } } } }, orderBy: { createdAt: "desc" }, skip: (input.page - 1) * input.pageSize, take: input.pageSize }),
    db.asset.count({ where }),
  ]);
  return { items: items.map((asset) => ({
    id: asset.id,
    slug: asset.slug,
    title: asset.title,
    category: asset.category,
    country: asset.country,
    askingPrice: decimalToString(asset.askingPrice),
    currency: asset.currency,
    status: asset.status,
    previousStatus: asset.previousStatus,
    sellerCompanyName: asset.seller.companyName,
    sellerUserId: asset.seller.userId,
    sellerStatus: asset.seller.user.status,
    createdAt: asset.createdAt,
    updatedAt: asset.updatedAt,
  })), pagination: { page: input.page, pageSize: input.pageSize, total, pageCount: Math.ceil(total / input.pageSize) } };
}

export async function updateUserModerationStatus(actorUserId: string, userId: string, status: UserStatus) {
  const user = await db.user.findUnique({ where: { id: userId } });
  if (!user) throw new AppError("User not found.", 404, "NOT_FOUND");
  if (user.role === UserRole.MANAGER && user.id === actorUserId && status === UserStatus.SUSPENDED) throw new AppError("Managers cannot suspend their own account.", 409, "INVALID_MODERATION");
  await db.user.update({ where: { id: userId }, data: { status } });
  logServer("info", "moderation.user_status_changed", { actorUserId, userId, from: user.status, to: status, role: user.role });
  await recordAuditEvent({ actorUserId, action: status === UserStatus.SUSPENDED ? "USER_SUSPENDED" : "USER_RESTORED", entityType: "user", entityId: userId, metadata: { from: user.status, to: status, role: user.role } });
  return { id: userId, status };
}

export async function suspendAsset(actorUserId: string, assetId: string) {
  const asset = await db.asset.findUnique({ where: { id: assetId } });
  if (!asset) throw new AppError("Asset not found.", 404, "NOT_FOUND");
  if (asset.status === AssetStatus.SUSPENDED) return { id: asset.id, status: asset.status };
  await db.asset.update({ where: { id: assetId }, data: { status: AssetStatus.SUSPENDED, previousStatus: asset.status } });
  logServer("info", "moderation.asset_suspended", { actorUserId, assetId, from: asset.status });
  await recordAuditEvent({ actorUserId, action: "ASSET_SUSPENDED", entityType: "asset", entityId: assetId, metadata: { from: asset.status, to: AssetStatus.SUSPENDED } });
  return { id: assetId, status: AssetStatus.SUSPENDED };
}

export async function restoreAsset(actorUserId: string, assetId: string) {
  const asset = await db.asset.findUnique({ where: { id: assetId } });
  if (!asset) throw new AppError("Asset not found.", 404, "NOT_FOUND");
  if (asset.status !== AssetStatus.SUSPENDED) return { id: asset.id, status: asset.status };
  const restored = asset.previousStatus ?? AssetStatus.DRAFT;
  await db.asset.update({ where: { id: assetId }, data: { status: restored, previousStatus: null } });
  logServer("info", "moderation.asset_restored", { actorUserId, assetId, to: restored });
  await recordAuditEvent({ actorUserId, action: "ASSET_RESTORED", entityType: "asset", entityId: assetId, metadata: { from: AssetStatus.SUSPENDED, to: restored } });
  return { id: assetId, status: restored };
}

export async function listAuditEvents() {
  return db.auditEvent.findMany({
    orderBy: { createdAt: "desc" },
    take: 60,
    include: { actor: { select: { id: true, email: true, role: true } } },
  });
}
