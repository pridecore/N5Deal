import { NextRequest } from "next/server";
import { errorResponse, AppError } from "@/server/errors";
import { requireUser } from "@/server/auth/guards";
import { assertTrustedOrigin } from "@/server/security/csrf";
import { assertRateLimit, rateLimitKey } from "@/server/security/rate-limit";
import { sendMessage } from "@/server/services/conversation-service";
import { sendMessageSchema } from "@/validation/messages";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser();
    assertTrustedOrigin(request);
    assertRateLimit({ key: rateLimitKey("message", user.id), limit: 20, windowMs: 60_000 });
    const input = sendMessageSchema.safeParse(await request.json());
    if (!input.success) throw new AppError("Please check the message.", 422, "VALIDATION_ERROR");
    const { id } = await params;
    return Response.json({ data: await sendMessage(id, user.id, input.data) }, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
