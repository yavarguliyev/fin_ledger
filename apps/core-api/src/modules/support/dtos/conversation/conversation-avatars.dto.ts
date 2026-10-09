import { z } from 'zod';

export const ConversationAvatarsSchema = z.object({
  customerAvatarUrl: z.string({ message: 'Customer avatar URL must be a string' }).nullable(),

  assignedStaffAvatarUrl: z.string({ message: 'Staff avatar URL must be a string' }).nullable()
});

export type ConversationAvatarsDto = z.infer<typeof ConversationAvatarsSchema>;
