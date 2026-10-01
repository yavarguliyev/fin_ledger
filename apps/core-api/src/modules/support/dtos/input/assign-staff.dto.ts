import { z } from 'zod';

export const AssignStaffSchema = z.object({
  conversationId: z.string({ message: 'Conversation ID must be a string' }).min(1, { message: 'Conversation ID is required' }),

  staffUserId: z.string({ message: 'Staff user ID must be a string' }).min(1, { message: 'Staff user ID is required' })
});

export type AssignStaffDto = z.infer<typeof AssignStaffSchema>;
