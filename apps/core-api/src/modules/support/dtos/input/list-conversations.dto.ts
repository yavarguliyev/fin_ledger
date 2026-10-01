import { z } from 'zod';

export const ListConversationsSchema = z.object({
  actorId: z.string({ message: 'Actor ID must be a string' }).min(1, { message: 'Actor ID is required' }),

  role: z.string({ message: 'Role must be a string' }),

  limit: z.number({ message: 'Limit must be a number' }).int().positive().optional(),

  offset: z.number({ message: 'Offset must be a number' }).int().min(0).optional()
});

export type ListConversationsDto = z.infer<typeof ListConversationsSchema>;
