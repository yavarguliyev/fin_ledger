import { z } from 'zod';
import { SUPPORT_MESSAGE_KINDS, SUPPORT_MESSAGE_SOURCES } from '@common/contracts';

export const CreateSupportMessageSchema = z.object({
  conversationId: z.string({ message: 'Conversation ID must be a string' }),

  senderUserId: z.string({ message: 'Sender user ID must be a string' }),

  kind: z.enum(SUPPORT_MESSAGE_KINDS, { message: 'Kind must be a valid message kind' }),

  source: z.enum(SUPPORT_MESSAGE_SOURCES, { message: 'Source must be a valid message source' }),

  body: z.string({ message: 'Body must be a string' }),

  replyToMessageId: z.string({ message: 'Reply target must be a string' }).optional()
});

export type CreateSupportMessageDto = z.infer<typeof CreateSupportMessageSchema>;
