import { NextRequest } from "next/server";
import { errorResponse, AppError } from "@/server/errors";
import { requireRole, requireUser } from "@/server/auth/guards";
import { editSellerAsset, getAssetDetails } from "@/server/services/asset-service";
import { updateAssetSchema } from "@/validation/assets";
import { assertTrustedOrigin } from "@/server/security/csrf";

type Context = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: Context) {
  try {
    const user = await requireUser();
    const { id } = await params;
    return Response.json({ data: await getAssetDetails(id, user) });
  } catch (error) { return errorResponse(error); }
}

export async function PATCH(request: NextRequest, { params }: Context) {
  try {
    const user = await requireRole("SELLER");
    assertTrustedOrigin(request);
    const input = updateAssetSchema.safeParse(await request.json());
    if (!input.success) throw new AppError("Please check the asset fields.", 422, "VALIDATION_ERROR");
    const { id } = await params;
    return Response.json({ data: await editSellerAsset(id, user.id, input.data) });
  } catch (error) { return errorResponse(error); }
}

export async function DELETE() {
  return Response.json({ error: { code: "METHOD_NOT_ALLOWED", message: "Use the archive action for assets." } }, { status: 405 });
}
