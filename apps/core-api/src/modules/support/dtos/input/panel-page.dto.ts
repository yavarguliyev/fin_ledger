import { z } from 'zod';

export const PanelPageSchema = z.object({
  conversationId: z.string({ message: 'Conversation ID must be a string' }).min(1, { message: 'Conversation ID is required' }),

  userId: z.string({ message: 'User ID must be a string' }).min(1, { message: 'User ID is required' }),

  role: z.string({ message: 'Role must be a string' }),

  limit: z.number({ message: 'Limit must be a number' }).int().positive().optional(),

  before: z.string({ message: 'Before must be a string' }).optional(),

  beforeId: z.string({ message: 'Before ID must be a string' }).optional()
});

export type PanelPageDto = z.infer<typeof PanelPageSchema>;
