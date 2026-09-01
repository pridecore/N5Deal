import { randomUUID } from "node:crypto";

type LogLevel = "info" | "warn" | "error";

type LogFields = Record<string, string | number | boolean | null | undefined>;

const redactedKeys = new Set(["password", "passwordHash", "token", "tokenHash", "session", "message", "body", "secret"]);

function sanitize(fields: LogFields = {}) {
  return Object.fromEntries(Object.entries(fields).filter(([key, value]) => value !== undefined && !redactedKeys.has(key)));
}

export function logServer(level: LogLevel, event: string, fields?: LogFields) {
  const payload = { level, event, timestamp: new Date().toISOString(), ...sanitize(fields) };
  const line = JSON.stringify(payload);
  if (level === "error") console.error(line);
  else if (level === "warn") console.warn(line);
  else console.info(line);
}

export function createRequestId() {
  return randomUUID();
}
