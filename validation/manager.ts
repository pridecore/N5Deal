import { AssetStatus, UserRole, UserStatus } from "@prisma/client";
import { z } from "zod";
import { assetCategories } from "@/validation/assets";

export const managerUserQuerySchema = z.object({
  search: z.string().trim().max(100).optional(),
  role: z.nativeEnum(UserRole).optional(),
  status: z.nativeEnum(UserStatus).optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(20),
});

export const managerAssetQuerySchema = z.object({
  search: z.string().trim().max(100).optional(),
  status: z.nativeEnum(AssetStatus).optional(),
  category: z.enum(assetCategories).optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(20),
});

export const updateUserStatusSchema = z.object({ status: z.enum(["ACTIVE", "SUSPENDED"]) });
export const updateAssetModerationStatusSchema = z.object({ status: z.enum(["SUSPENDED", "RESTORED"]) });

export type ManagerUserQueryInput = z.infer<typeof managerUserQuerySchema>;
export type ManagerAssetQueryInput = z.infer<typeof managerAssetQuerySchema>;
