import { z } from 'zod';

export const StarredMessageSchema = z.object({
  messageId: z.string({ message: 'Message ID must be a string' }),

  conversationId: z.string({ message: 'Conversation ID must be a string' }),

  kind: z.string({ message: 'Kind must be a string' }),

  body: z.string({ message: 'Body must be a string' }).nullable(),

  fileName: z.string({ message: 'File name must be a string' }).nullable(),

  createdAt: z.date({ message: 'Created at must be a date' }),

  starredAt: z.date({ message: 'Starred at must be a date' })
});

export type StarredMessageDto = z.infer<typeof StarredMessageSchema>;
