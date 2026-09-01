import { NextRequest } from "next/server";
import { AssetStatus } from "@prisma/client";
import { errorResponse } from "@/server/errors";
import { requireRole } from "@/server/auth/guards";
import { transitionSellerAsset } from "@/server/services/asset-service";
import { assertTrustedOrigin } from "@/server/security/csrf";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireRole("SELLER");
    assertTrustedOrigin(request);
    const { id } = await params;
    return Response.json({ data: await transitionSellerAsset(id, user.id, AssetStatus.PUBLISHED) });
  } catch (error) { return errorResponse(error); }
}
