import { z } from 'zod';

import { ReadConversationSchema } from '../../../support';

export const MessagePinSchema = ReadConversationSchema.extend({
  messageId: z.string({ message: 'Message ID must be a string' }).min(1, { message: 'Message ID is required' })
});

export type MessagePinDto = z.infer<typeof MessagePinSchema>;
