import { db } from "@/server/db";

export function createSessionRecord(tokenHash: string, userId: string, expiresAt: Date) {
  return db.session.create({ data: { tokenHash, userId, expiresAt } });
}

export function findValidSession(tokenHash: string) {
  return db.session.findUnique({
    where: { tokenHash },
    include: { user: { select: { id: true, email: true, role: true, status: true, buyerProfile: true, sellerProfile: true } } },
  });
}

export function deleteSessionRecord(tokenHash: string) {
  return db.session.deleteMany({ where: { tokenHash } });
}
