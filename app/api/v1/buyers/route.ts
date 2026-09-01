import { NextRequest } from "next/server";
import { errorResponse, AppError } from "@/server/errors";
import { requireRole } from "@/server/auth/guards";
import { listDiscoverableBuyers } from "@/server/services/buyer-discovery-service";
import { buyerDiscoveryQuerySchema } from "@/validation/buyers";

export async function GET(request: NextRequest) {
  try {
    const user = await requireRole("SELLER");
    const query = buyerDiscoveryQuerySchema.safeParse(Object.fromEntries([...request.nextUrl.searchParams].filter(([, value]) => value !== "")));
    if (!query.success) throw new AppError("Invalid buyer filters.", 422, "VALIDATION_ERROR");
    return Response.json({ data: await listDiscoverableBuyers(query.data, user.id) });
  } catch (error) {
    return errorResponse(error);
  }
}
