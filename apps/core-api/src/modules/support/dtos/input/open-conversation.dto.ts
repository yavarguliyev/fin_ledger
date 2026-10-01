import { z } from 'zod';

export const OpenConversationSchema = z.object({
  userId: z.string({ message: 'User ID must be a string' }).min(1, { message: 'User ID is required' }),

  role: z.string({ message: 'Role must be a string' }),

  staffUserId: z.string({ message: 'Staff user ID must be a string' }).min(1, { message: 'Staff user ID is required' }),

  subject: z.string({ message: 'Subject must be a string' }).optional()
});

export type OpenConversationDto = z.infer<typeof OpenConversationSchema>;
