import { z } from 'zod';

import { SupportConversationSchema } from '../conversation/support-conversation.dto';

export const ConversationAccessSchema = z.object({
  conversation: SupportConversationSchema,

  userId: z.string({ message: 'User ID must be a string' }),

  role: z.string({ message: 'Role must be a string' })
});

export type ConversationAccessDto = z.infer<typeof ConversationAccessSchema>;
