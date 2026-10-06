import { z } from 'zod';

export const ConversationIdRowSchema = z.object({
  id: z.string({ message: 'ID must be a string' })
});

export type ConversationIdRowDto = z.infer<typeof ConversationIdRowSchema>;
