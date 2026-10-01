import { z } from 'zod';
import { SupportMessageSource } from '@common/libs';

import { StoredAttachmentSchema } from '../attachment/stored-attachment.dto';

export const AddAttachmentMessageSchema = StoredAttachmentSchema.extend({
  conversationId: z.string({ message: 'Conversation ID must be a string' }),

  senderUserId: z.string({ message: 'Sender user ID must be a string' }),

  source: z.enum(SupportMessageSource),

  body: z.string({ message: 'Body must be a string' }).nullable(),

  durationSeconds: z.number({ message: 'Duration must be a number' }).int().positive().nullable()
});

export type AddAttachmentMessageDto = z.infer<typeof AddAttachmentMessageSchema>;
