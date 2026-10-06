import { z } from 'zod';

export const SetPrivacySchema = z.object({
  conversationId: z.string({ message: 'Conversation ID must be a string' }).min(1),

  userId: z.string({ message: 'User ID must be a string' }).min(1),

  enabled: z.boolean({ message: 'Enabled must be a boolean' })
});

export type SetPrivacyDto = z.infer<typeof SetPrivacySchema>;
