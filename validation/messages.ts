import { z } from "zod";

const htmlLikePattern = /<[^>]*>|javascript:/i;

export const messageBodySchema = z.string()
  .trim()
  .min(1, "Message cannot be empty.")
  .max(2000, "Message must be 2,000 characters or less.")
  .refine((value) => !htmlLikePattern.test(value), "HTML is not allowed in messages.");

export const startConversationSchema = z.object({
  assetId: z.string().trim().min(1).optional(),
  buyerId: z.string().trim().min(1).optional(),
  message: messageBodySchema,
}).refine((input) => input.assetId || input.buyerId, "Choose an asset or buyer to contact.");

export const sendMessageSchema = z.object({ body: messageBodySchema });

export type StartConversationInput = z.infer<typeof startConversationSchema>;
export type SendMessageInput = z.infer<typeof sendMessageSchema>;
