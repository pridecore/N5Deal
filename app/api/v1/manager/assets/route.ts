import { NextRequest } from "next/server";
import { errorResponse, AppError } from "@/server/errors";
import { requireRole } from "@/server/auth/guards";
import { listManagerAssets } from "@/server/services/manager-service";
import { managerAssetQuerySchema } from "@/validation/manager";

export async function GET(request: NextRequest) {
  try {
    await requireRole("MANAGER");
    const query = managerAssetQuerySchema.safeParse(Object.fromEntries([...request.nextUrl.searchParams].filter(([, value]) => value !== "")));
    if (!query.success) throw new AppError("Invalid asset filters.", 422, "VALIDATION_ERROR");
    return Response.json({ data: await listManagerAssets(query.data) });
  } catch (error) {
    return errorResponse(error);
  }
}
