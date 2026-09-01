import { NextRequest } from "next/server";
import { errorResponse, AppError } from "@/server/errors";
import { requireUser } from "@/server/auth/guards";
import { assertTrustedOrigin } from "@/server/security/csrf";
import { assertRateLimit, rateLimitKey } from "@/server/security/rate-limit";
import { listConversations, startConversation } from "@/server/services/conversation-service";
import { startConversationSchema } from "@/validation/messages";

export async function GET() {
  try {
    const user = await requireUser();
    return Response.json({ data: await listConversations(user.id) });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireUser();
    assertTrustedOrigin(request);
    assertRateLimit({ key: rateLimitKey("conversation", user.id), limit: 10, windowMs: 60_000 });
    const input = startConversationSchema.safeParse(await request.json());
    if (!input.success) throw new AppError("Please check the contact message.", 422, "VALIDATION_ERROR");
    return Response.json({ data: await startConversation(user, input.data) }, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
