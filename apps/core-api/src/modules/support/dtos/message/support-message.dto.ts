import { z } from 'zod';
import { SUPPORT_MESSAGE_KINDS, SUPPORT_MESSAGE_SOURCES } from '@common/contracts';

import { ReactionSchema } from './reaction.dto';

export const SupportMessageSchema = z.object({
  id: z.string({ message: 'ID must be a string' }),

  conversationId: z.string({ message: 'Conversation ID must be a string' }),

  senderUserId: z.string({ message: 'Sender user ID must be a string' }).nullable(),

  senderName: z.string({ message: 'Sender name must be a string' }).nullable().optional(),

  senderRole: z.string({ message: 'Sender role must be a string' }).nullable().optional(),

  kind: z.enum(SUPPORT_MESSAGE_KINDS, { message: 'Kind must be a valid message kind' }),

  source: z.enum(SUPPORT_MESSAGE_SOURCES, { message: 'Source must be a valid message source' }),

  body: z.string({ message: 'Body must be a string' }).nullable(),

  storageKey: z.string({ message: 'Storage key must be a string' }).nullable(),

  fileName: z.string({ message: 'File name must be a string' }).nullable(),

  mimeType: z.string({ message: 'Mime type must be a string' }).nullable(),

  sizeBytes: z.number({ message: 'Size bytes must be a number' }).nullable(),

  durationSeconds: z.number({ message: 'Duration seconds must be a number' }).nullable(),

  editedAt: z.string({ message: 'Edited at must be a string' }).nullable(),

  deletedAt: z.string({ message: 'Deleted at must be a string' }).nullable(),

  seen: z.boolean({ message: 'Seen must be a boolean' }).optional(),

  replyToMessageId: z.string().nullable().optional(),

  replyToSenderUserId: z.string().nullable().optional(),

  replyToSenderName: z.string().nullable().optional(),

  replyToBody: z.string().nullable().optional(),

  replyToKind: z.enum(SUPPORT_MESSAGE_KINDS).nullable().optional(),

  replyToDeleted: z.boolean().nullable().optional(),

  reactions: z.array(ReactionSchema).optional(),

  createdAt: z.string({ message: 'Created at must be a string' })
});

export type SupportMessageDto = z.infer<typeof SupportMessageSchema>;
