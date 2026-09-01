import { NextRequest } from "next/server";
import { loginSchema } from "@/validation/auth";
import { errorResponse, AppError } from "@/server/errors";
import { authenticate, startSession } from "@/server/services/auth-service";
import { recordAuditEvent } from "@/server/services/audit-service";
import { assertTrustedOrigin } from "@/server/security/csrf";
import { assertRateLimit, rateLimitKey } from "@/server/security/rate-limit";

export async function POST(request: NextRequest) {
  try {
    assertTrustedOrigin(request);
    const input = loginSchema.safeParse(await request.json());
    if (!input.success) throw new AppError("Please check the highlighted fields.", 422, "VALIDATION_ERROR");
    assertRateLimit({ key: rateLimitKey("login", input.data.email.toLowerCase()), limit: 8, windowMs: 60_000 });
    const user = await authenticate(input.data.email, input.data.password);
    await startSession(user.id);
    await recordAuditEvent({ actorUserId: user.id, action: "LOGIN", entityType: "user", entityId: user.id, metadata: { role: user.role } });
    return Response.json({ data: { id: user.id, email: user.email, role: user.role } });
  } catch (error) {
    return errorResponse(error);
  }
}
