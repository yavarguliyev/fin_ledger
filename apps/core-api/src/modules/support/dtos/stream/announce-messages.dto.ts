import { z } from 'zod';
import { SupportMessageContractSchema } from '@common/contracts';

import { SupportConversationSchema } from '../conversation/support-conversation.dto';

export const AnnounceMessagesSchema = z.object({
  type: z.string({ message: 'Type must be a string' }),

  conversation: SupportConversationSchema,

  senderUserId: z.string({ message: 'Sender user ID must be a string' }),

  role: z.string({ message: 'Role must be a string' }),

  messages: z.array(SupportMessageContractSchema)
});

export type AnnounceMessagesDto = z.infer<typeof AnnounceMessagesSchema>;
