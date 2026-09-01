import { UserRole } from "@prisma/client";
import { AppError } from "@/server/errors";
import { getCurrentUser } from "@/server/services/auth-service";

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) throw new AppError("Authentication required.", 401, "UNAUTHENTICATED");
  return user;
}

export async function requireRole(...roles: UserRole[]) {
  const user = await requireUser();
  if (!roles.includes(user.role)) throw new AppError("You do not have permission to perform this action.", 403, "FORBIDDEN");
  return user;
}

export function assertOwnership(ownerId: string, userId: string): void {
  if (ownerId !== userId) throw new AppError("You do not own this resource.", 403, "FORBIDDEN");
}
