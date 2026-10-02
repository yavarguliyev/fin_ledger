import { z } from 'zod';
import { SUPPORT_MESSAGE_KINDS, SUPPORT_MESSAGE_SOURCES } from '@common/contracts';

export const SendMessageSchema = z.object({
  conversationId: z.string({ message: 'Conversation ID must be a string' }).min(1, { message: 'Conversation ID is required' }),

  senderUserId: z.string({ message: 'Sender user ID must be a string' }).min(1, { message: 'Sender user ID is required' }),

  role: z.string({ message: 'Role must be a string' }),

  body: z.string({ message: 'Body must be a string' }).optional(),

  kind: z.enum(SUPPORT_MESSAGE_KINDS, { message: 'Kind must be a valid message kind' }).optional(),

  source: z.enum(SUPPORT_MESSAGE_SOURCES, { message: 'Source must be a valid message source' }).optional(),

  replyToMessageId: z.string({ message: 'Reply target must be a string' }).optional()
});

export type SendMessageDto = z.infer<typeof SendMessageSchema>;
