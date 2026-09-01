import type { AuditAction, Prisma } from "@prisma/client";
import { db } from "@/server/db";

type AuditInput = {
  actorUserId?: string | null;
  action: AuditAction;
  entityType: string;
  entityId: string;
  metadata?: Prisma.InputJsonValue;
};

export async function recordAuditEvent(input: AuditInput) {
  return db.auditEvent.create({
    data: {
      actorUserId: input.actorUserId ?? null,
      action: input.action,
      entityType: input.entityType,
      entityId: input.entityId,
      metadata: input.metadata ?? undefined,
    },
  });
}
