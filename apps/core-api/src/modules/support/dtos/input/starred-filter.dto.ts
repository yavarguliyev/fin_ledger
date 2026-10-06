import { z } from 'zod';

export const StarredFilterSchema = z.object({
  userId: z.string({ message: 'User ID must be a string' }).min(1),

  conversationId: z.string({ message: 'Conversation ID must be a string' }).min(1)
});

export type StarredFilterDto = z.infer<typeof StarredFilterSchema>;
