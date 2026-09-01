import { UserRole, UserStatus } from "@prisma/client";
import { db } from "@/server/db";

export function findUserByEmail(email: string) {
  return db.user.findUnique({
    where: { email: email.toLowerCase() },
    include: { buyerProfile: true, sellerProfile: true },
  });
}

export function findUserById(id: string) {
  return db.user.findUnique({
    where: { id },
    select: { id: true, email: true, role: true, status: true, buyerProfile: true, sellerProfile: true },
  });
}

export function findMarketplaceCounts() {
  return Promise.all([
    db.user.count({ where: { role: UserRole.BUYER, status: UserStatus.ACTIVE } }),
    db.user.count({ where: { role: UserRole.SELLER, status: UserStatus.ACTIVE } }),
    db.asset.count({ where: { status: "PUBLISHED" } }),
    db.conversation.count({ where: { status: "ACTIVE" } }),
  ]);
}
