import { z } from 'zod';

export const ConversationIdRequestSchema = z.object({
  id: z.string({ message: 'ID must be a string' }).min(1, { message: 'ID is required' })
});

export type ConversationIdRequestDto = z.infer<typeof ConversationIdRequestSchema>;
