import bcrypt from "bcryptjs";
import { randomBytes, createHash } from "node:crypto";
import { cookies } from "next/headers";
import { UserStatus } from "@prisma/client";
import { env } from "@/lib/env";
import { AppError } from "@/server/errors";
import { createSessionRecord, deleteSessionRecord, findValidSession } from "@/server/repositories/session-repository";
import { findUserByEmail } from "@/server/repositories/user-repository";
import { logServer } from "@/server/logger";

export const SESSION_COOKIE = "n5deal_session";
const SESSION_DURATION_MS = 1000 * 60 * 60 * 24 * 7;

function hashToken(token: string): string {
  return createHash("sha256").update(`${env.SESSION_SECRET}:${token}`).digest("hex");
}

export async function authenticate(email: string, password: string) {
  const user = await findUserByEmail(email);
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    logServer("warn", "auth.login_failed", { email: email.toLowerCase() });
    throw new AppError("Invalid email or password.", 401, "INVALID_CREDENTIALS");
  }
  if (user.status === UserStatus.SUSPENDED) {
    logServer("warn", "auth.suspended_login", { userId: user.id, role: user.role });
    throw new AppError("This account is currently suspended.", 403, "ACCOUNT_SUSPENDED");
  }
  return user;
}

export async function startSession(userId: string): Promise<void> {
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);
  await createSessionRecord(hashToken(token), userId, expiresAt);
  logServer("info", "auth.session_started", { userId });
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    expires: expiresAt,
    path: "/",
  });
}

export async function endSession(): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (token) await deleteSessionRecord(hashToken(token));
  if (token) logServer("info", "auth.session_ended", {});
  cookieStore.delete(SESSION_COOKIE);
}

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const session = await findValidSession(hashToken(token));
  if (!session || session.expiresAt < new Date() || session.user.status === UserStatus.SUSPENDED) return null;
  return session.user;
}
