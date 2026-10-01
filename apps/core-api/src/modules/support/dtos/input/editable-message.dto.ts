import { z } from 'zod';

import { SupportMessageSchema } from '../message/support-message.dto';

export const EditableMessageSchema = z.object({
  existing: SupportMessageSchema.nullable(),

  conversationId: z.string({ message: 'Conversation ID must be a string' }),

  userId: z.string({ message: 'User ID must be a string' }),

  body: z.string({ message: 'Body must be a string' }).optional(),

  hasFile: z.boolean({ message: 'Has file must be a boolean' })
});

export type EditableMessageDto = z.infer<typeof EditableMessageSchema>;
