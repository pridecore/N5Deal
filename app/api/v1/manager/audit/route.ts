import { errorResponse } from "@/server/errors";
import { requireRole } from "@/server/auth/guards";
import { listAuditEvents } from "@/server/services/manager-service";

export async function GET() {
  try {
    await requireRole("MANAGER");
    return Response.json({ data: await listAuditEvents() });
  } catch (error) {
    return errorResponse(error);
  }
}
