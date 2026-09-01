import { NextRequest } from "next/server";
import { errorResponse, AppError } from "@/server/errors";
import { requireRole } from "@/server/auth/guards";
import { restoreAsset, suspendAsset } from "@/server/services/manager-service";
import { updateAssetModerationStatusSchema } from "@/validation/manager";
import { assertTrustedOrigin } from "@/server/security/csrf";
import { assertRateLimit, rateLimitKey } from "@/server/security/rate-limit";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const manager = await requireRole("MANAGER");
    assertTrustedOrigin(request);
    assertRateLimit({ key: rateLimitKey("moderation", manager.id), limit: 30, windowMs: 60_000 });
    const input = updateAssetModerationStatusSchema.safeParse(await request.json());
    if (!input.success) throw new AppError("Invalid status.", 422, "VALIDATION_ERROR");
    const { id } = await params;
    return Response.json({ data: input.data.status === "SUSPENDED" ? await suspendAsset(manager.id, id) : await restoreAsset(manager.id, id) });
  } catch (error) {
    return errorResponse(error);
  }
}
