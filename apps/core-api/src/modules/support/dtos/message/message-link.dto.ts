import { z } from 'zod';

export const MessageLinkSchema = z.object({
  id: z.string({ message: 'ID must be a string' }),

  messageId: z.string({ message: 'Message ID must be a string' }),

  url: z.string({ message: 'URL must be a string' }),

  body: z.string({ message: 'Body must be a string' }).nullable(),

  senderName: z.string({ message: 'Sender name must be a string' }).nullable(),

  createdAt: z.date({ message: 'Created at must be a date' })
});

export type MessageLinkDto = z.infer<typeof MessageLinkSchema>;
