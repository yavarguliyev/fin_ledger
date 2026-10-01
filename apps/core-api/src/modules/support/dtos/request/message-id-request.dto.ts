import { z } from 'zod';

export const MessageIdRequestSchema = z.object({
  id: z.uuid({ message: 'Conversation ID must be a valid UUID' }),

  messageId: z.uuid({ message: 'Message ID must be a valid UUID' })
});

export type MessageIdRequestDto = z.infer<typeof MessageIdRequestSchema>;
