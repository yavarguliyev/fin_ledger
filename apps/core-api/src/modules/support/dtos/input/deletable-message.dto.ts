import { z } from 'zod';
import { SupportDeleteScope } from '@common/libs';

import { SupportMessageSchema } from '../message/support-message.dto';

export const DeletableMessageSchema = z.object({
  existing: SupportMessageSchema.nullable(),

  conversationId: z.string({ message: 'Conversation ID must be a string' }),

  userId: z.string({ message: 'User ID must be a string' }),

  scope: z.enum(SupportDeleteScope)
});

export type DeletableMessageDto = z.infer<typeof DeletableMessageSchema>;
