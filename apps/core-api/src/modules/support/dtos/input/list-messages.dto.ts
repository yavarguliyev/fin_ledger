import { z } from 'zod';

export const ListMessagesSchema = z.object({
  conversationId: z.string({ message: 'Conversation ID must be a string' }).min(1, { message: 'Conversation ID is required' }),

  actorId: z.string({ message: 'Actor ID must be a string' }).min(1, { message: 'Actor ID is required' }),

  limit: z.number({ message: 'Limit must be a number' }).int().positive().optional(),

  before: z.string({ message: 'Before must be a string' }).optional()
});

export type ListMessagesDto = z.infer<typeof ListMessagesSchema>;
