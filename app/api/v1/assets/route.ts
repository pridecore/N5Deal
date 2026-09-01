import { NextRequest } from "next/server";
import { assetQuerySchema, createAssetSchema } from "@/validation/assets";
import { errorResponse, AppError } from "@/server/errors";
import { requireRole, requireUser } from "@/server/auth/guards";
import { createSellerAsset, getPublishedAssets } from "@/server/services/asset-service";
import { assertTrustedOrigin } from "@/server/security/csrf";

export async function GET(request: NextRequest) {
  try {
    const query = assetQuerySchema.safeParse(Object.fromEntries([...request.nextUrl.searchParams].filter(([, value]) => value !== "")));
    if (!query.success) throw new AppError("Invalid asset filters.", 422, "VALIDATION_ERROR");
    const user = await requireUser();
    return Response.json({ data: await getPublishedAssets(query.data, user) });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireRole("SELLER");
    assertTrustedOrigin(request);
    const input = createAssetSchema.safeParse(await request.json());
    if (!input.success) throw new AppError("Please check the asset fields.", 422, "VALIDATION_ERROR");
    const asset = await createSellerAsset(user.id, input.data);
    return Response.json({ data: asset }, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
