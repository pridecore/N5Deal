import { NextRequest } from "next/server";
import { endSession } from "@/server/services/auth-service";
import { assertTrustedOrigin } from "@/server/security/csrf";

export async function POST(request: NextRequest) {
  assertTrustedOrigin(request);
  await endSession();
  return Response.json({ data: { success: true } });
}
