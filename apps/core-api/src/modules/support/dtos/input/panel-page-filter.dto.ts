import { z } from 'zod';

export const PanelPageFilterSchema = z.object({
  conversationId: z.string({ message: 'Conversation ID must be a string' }).min(1),

  userId: z.string({ message: 'User ID must be a string' }).min(1),

  limit: z.number({ message: 'Limit must be a number' }).int().positive(),

  before: z.string({ message: 'Before must be a string' }).optional(),

  beforeId: z.string({ message: 'Before ID must be a string' }).optional()
});

export type PanelPageFilterDto = z.infer<typeof PanelPageFilterSchema>;
