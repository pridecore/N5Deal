import { NextRequest } from "next/server";
import { errorResponse, AppError } from "@/server/errors";
import { requireRole } from "@/server/auth/guards";
import { listManagerUsers } from "@/server/services/manager-service";
import { managerUserQuerySchema } from "@/validation/manager";

export async function GET(request: NextRequest) {
  try {
    await requireRole("MANAGER");
    const query = managerUserQuerySchema.safeParse(Object.fromEntries([...request.nextUrl.searchParams].filter(([, value]) => value !== "")));
    if (!query.success) throw new AppError("Invalid user filters.", 422, "VALIDATION_ERROR");
    return Response.json({ data: await listManagerUsers(query.data) });
  } catch (error) {
    return errorResponse(error);
  }
}
