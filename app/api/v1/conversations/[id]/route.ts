import { errorResponse } from "@/server/errors";
import { requireUser } from "@/server/auth/guards";
import { getConversation } from "@/server/services/conversation-service";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser();
    const { id } = await params;
    return Response.json({ data: await getConversation(id, user.id) });
  } catch (error) {
    return errorResponse(error);
  }
}
