import { errorResponse, AppError } from "@/server/errors";
import { requireRole } from "@/server/auth/guards";
import { getAssetMatch } from "@/server/services/match-service";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireRole("BUYER");
    const { id } = await params;
    const match = await getAssetMatch(id, user.id);
    if (!match) throw new AppError("Asset not found.", 404, "NOT_FOUND");
    return Response.json({ data: match });
  } catch (error) {
    return errorResponse(error);
  }
}
