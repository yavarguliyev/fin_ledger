import { z } from 'zod';

import { ReadConversationSchema } from './read-conversation.dto';

export const StarMessageSchema = ReadConversationSchema.extend({
  messageId: z.string({ message: 'Message ID must be a string' }).min(1, { message: 'Message ID is required' }),

  starred: z.boolean({ message: 'Starred must be a boolean' })
});

export type StarMessageDto = z.infer<typeof StarMessageSchema>;
