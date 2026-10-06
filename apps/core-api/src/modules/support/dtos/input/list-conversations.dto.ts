import { z } from 'zod';

export const ListConversationsSchema = z.object({
  actorId: z.string({ message: 'Actor ID must be a string' }).min(1, { message: 'Actor ID is required' }),

  role: z.string({ message: 'Role must be a string' }),

  limit: z.number({ message: 'Limit must be a number' }).int().positive().optional(),

  before: z.string({ message: 'Before must be a string' }).optional(),

  beforeId: z.string({ message: 'Before ID must be a string' }).optional()
});

export type ListConversationsDto = z.infer<typeof ListConversationsSchema>;
