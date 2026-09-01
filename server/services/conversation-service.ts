import { AssetStatus, UserRole, UserStatus } from "@prisma/client";
import { AppError } from "@/server/errors";
import { db } from "@/server/db";
import { recordAuditEvent } from "@/server/services/audit-service";
import type { SendMessageInput, StartConversationInput } from "@/validation/messages";

const pageSize = 40;

function serializeConversation(conversation: Awaited<ReturnType<typeof findConversationForUser>>) {
  if (!conversation) return null;
  return {
    id: conversation.id,
    status: conversation.status,
    asset: conversation.asset ? { id: conversation.asset.id, slug: conversation.asset.slug, title: conversation.asset.title, status: conversation.asset.status } : null,
    buyer: conversation.buyer.buyerProfile ? { id: conversation.buyer.id, companyName: conversation.buyer.buyerProfile.companyName, fullName: conversation.buyer.buyerProfile.fullName } : { id: conversation.buyer.id, companyName: "Buyer", fullName: "Buyer" },
    seller: conversation.seller.sellerProfile ? { id: conversation.seller.id, companyName: conversation.seller.sellerProfile.companyName, fullName: conversation.seller.sellerProfile.fullName } : { id: conversation.seller.id, companyName: "Seller", fullName: "Seller" },
    latestMessage: conversation.messages[0] ? { body: conversation.messages[0].body, senderId: conversation.messages[0].senderId, createdAt: conversation.messages[0].createdAt } : null,
    messages: [...conversation.messages].reverse().map((message) => ({ id: message.id, senderId: message.senderId, body: message.body, createdAt: message.createdAt })),
    updatedAt: conversation.updatedAt,
    createdAt: conversation.createdAt,
  };
}

async function findConversationForUser(id: string, userId: string) {
  return db.conversation.findFirst({
    where: { id, OR: [{ buyerId: userId }, { sellerId: userId }] },
    include: {
      buyer: { include: { buyerProfile: true } },
      seller: { include: { sellerProfile: true } },
      asset: true,
      messages: { orderBy: { createdAt: "desc" }, take: pageSize },
    },
  });
}

async function assertActiveParticipant(userId: string) {
  const user = await db.user.findUnique({ where: { id: userId }, select: { status: true } });
  if (!user || user.status !== UserStatus.ACTIVE) throw new AppError("Suspended users cannot use messaging.", 403, "ACCOUNT_SUSPENDED");
}

export async function listConversations(userId: string) {
  const conversations = await db.conversation.findMany({
    where: { OR: [{ buyerId: userId }, { sellerId: userId }] },
    include: {
      buyer: { include: { buyerProfile: true } },
      seller: { include: { sellerProfile: true } },
      asset: true,
      messages: { orderBy: { createdAt: "desc" }, take: 1 },
    },
    orderBy: { updatedAt: "desc" },
    take: 50,
  });
  return conversations.map(serializeConversation);
}

export async function getConversation(id: string, userId: string) {
  const conversation = await findConversationForUser(id, userId);
  if (!conversation) throw new AppError("Conversation not found.", 404, "NOT_FOUND");
  return serializeConversation(conversation);
}

export async function startConversation(user: { id: string; role: UserRole }, input: StartConversationInput) {
  await assertActiveParticipant(user.id);
  let buyerId = user.role === UserRole.BUYER ? user.id : input.buyerId;
  let sellerId = user.role === UserRole.SELLER ? user.id : undefined;
  const assetId = input.assetId ?? null;

  if (input.assetId) {
    const asset = await db.asset.findUnique({ where: { id: input.assetId }, include: { seller: { include: { user: true } } } });
    if (!asset || asset.status !== AssetStatus.PUBLISHED || asset.seller.user.status !== UserStatus.ACTIVE) throw new AppError("Asset is not available for contact.", 404, "NOT_FOUND");
    sellerId = asset.seller.userId;
    if (user.role === UserRole.SELLER && user.id !== sellerId) throw new AppError("Sellers can only contact buyers from their own assets or buyer profiles.", 403, "FORBIDDEN");
  }

  if (input.buyerId) {
    const buyer = await db.user.findUnique({ where: { id: input.buyerId }, include: { buyerProfile: true } });
    if (!buyer || buyer.role !== UserRole.BUYER || buyer.status !== UserStatus.ACTIVE || !buyer.buyerProfile) throw new AppError("Buyer profile not found.", 404, "NOT_FOUND");
    buyerId = buyer.id;
  }

  if (!buyerId || !sellerId || buyerId === sellerId) throw new AppError("Conversation participants are invalid.", 422, "VALIDATION_ERROR");

  const other = await db.user.findMany({ where: { id: { in: [buyerId, sellerId] }, status: UserStatus.ACTIVE } });
  if (other.length !== 2) throw new AppError("Suspended participants cannot be contacted.", 403, "ACCOUNT_SUSPENDED");

  const conversation = await db.$transaction(async (tx) => {
    const existing = await tx.conversation.findFirst({ where: { buyerId, sellerId, assetId } });
    const thread = existing ?? await tx.conversation.create({ data: { buyerId, sellerId, assetId } });
    await tx.message.create({ data: { conversationId: thread.id, senderId: user.id, body: input.message } });
    return tx.conversation.update({ where: { id: thread.id }, data: { updatedAt: new Date() } });
  });

  await recordAuditEvent({ actorUserId: user.id, action: "CONVERSATION_CREATED", entityType: "conversation", entityId: conversation.id, metadata: { buyerId, sellerId, assetId } });
  return getConversation(conversation.id, user.id);
}

export async function sendMessage(conversationId: string, userId: string, input: SendMessageInput) {
  await assertActiveParticipant(userId);
  const conversation = await db.conversation.findFirst({ where: { id: conversationId, OR: [{ buyerId: userId }, { sellerId: userId }] } });
  if (!conversation) throw new AppError("Conversation not found.", 404, "NOT_FOUND");
  const receiverId = conversation.buyerId === userId ? conversation.sellerId : conversation.buyerId;
  await assertActiveParticipant(receiverId);
  const message = await db.$transaction(async (tx) => {
    const created = await tx.message.create({ data: { conversationId, senderId: userId, body: input.body } });
    await tx.conversation.update({ where: { id: conversationId }, data: { updatedAt: new Date() } });
    return created;
  });
  await recordAuditEvent({ actorUserId: userId, action: "MESSAGE_SENT", entityType: "conversation", entityId: conversationId, metadata: { messageId: message.id } });
  return { id: message.id, senderId: message.senderId, body: message.body, createdAt: message.createdAt };
}
