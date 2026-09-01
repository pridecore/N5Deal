import { NextRequest } from "next/server";
import { errorResponse, AppError } from "@/server/errors";
import { requireRole } from "@/server/auth/guards";
import { getBuyerProfile, saveBuyerProfile } from "@/server/services/buyer-service";
import { buyerProfileSchema } from "@/validation/buyer";
import { assertTrustedOrigin } from "@/server/security/csrf";

export async function GET() {
  try { const user = await requireRole("BUYER"); return Response.json({ data: await getBuyerProfile(user.id) }); }
  catch (error) { return errorResponse(error); }
}

export async function PATCH(request: NextRequest) {
  try {
    const user = await requireRole("BUYER");
    assertTrustedOrigin(request);
    const input = buyerProfileSchema.safeParse(await request.json());
    if (!input.success) throw new AppError("Please check your acquisition criteria.", 422, "VALIDATION_ERROR");
    return Response.json({ data: await saveBuyerProfile(user.id, input.data) });
  } catch (error) { return errorResponse(error); }
}
