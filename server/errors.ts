import { createRequestId, logServer } from "@/server/logger";

export class AppError extends Error {
  constructor(
    message: string,
    public readonly statusCode = 500,
    public readonly code = "INTERNAL_ERROR",
  ) {
    super(message);
    this.name = "AppError";
  }
}

export function errorResponse(error: unknown): Response {
  const requestId = createRequestId();
  if (error instanceof AppError) {
    if (error.statusCode >= 500) logServer("error", "api.app_error", { requestId, code: error.code, statusCode: error.statusCode });
    return Response.json({ error: { code: error.code, message: error.message, requestId } }, { status: error.statusCode, headers: { "x-request-id": requestId } });
  }

  logServer("error", "api.unexpected_error", { requestId, name: error instanceof Error ? error.name : "unknown" });
  return Response.json(
    { error: { code: "INTERNAL_ERROR", message: "Something went wrong. Please try again.", requestId } },
    { status: 500, headers: { "x-request-id": requestId } },
  );
}
