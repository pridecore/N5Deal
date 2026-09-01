import { NextRequest } from "next/server";
import { AppError } from "@/server/errors";

const unsafeMethods = new Set(["POST", "PUT", "PATCH", "DELETE"]);

export function assertTrustedOrigin(request: NextRequest): void {
  if (!unsafeMethods.has(request.method)) return;

  const expectedOrigin = request.nextUrl.origin;
  const origin = request.headers.get("origin");
  const referer = request.headers.get("referer");
  const candidate = origin ?? referer;

  if (!candidate) {
    if (process.env.NODE_ENV === "production") throw new AppError("Missing request origin.", 403, "CSRF_REJECTED");
    return;
  }

  let actualOrigin: string;
  try {
    actualOrigin = new URL(candidate).origin;
  } catch {
    throw new AppError("Invalid request origin.", 403, "CSRF_REJECTED");
  }

  if (actualOrigin !== expectedOrigin) throw new AppError("Cross-site mutation rejected.", 403, "CSRF_REJECTED");
}
