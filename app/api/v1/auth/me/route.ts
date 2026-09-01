import { errorResponse } from "@/server/errors";
import { requireUser } from "@/server/auth/guards";

export async function GET() {
  try {
    const user = await requireUser();
    return Response.json({ data: user });
  } catch (error) {
    return errorResponse(error);
  }
}
