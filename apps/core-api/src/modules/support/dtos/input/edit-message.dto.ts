import { z } from 'zod';
import { UploadFile } from '@common/libs';

export const EditMessageSchema = z.object({
  conversationId: z.string({ message: 'Conversation ID must be a string' }).min(1, { message: 'Conversation ID is required' }),

  messageId: z.string({ message: 'Message ID must be a string' }).min(1, { message: 'Message ID is required' }),

  userId: z.string({ message: 'User ID must be a string' }).min(1, { message: 'User ID is required' }),

  role: z.string({ message: 'Role must be a string' }),

  body: z.string({ message: 'Body must be a string' }).optional(),

  file: z.custom<UploadFile>().optional()
});

export type EditMessageDto = z.infer<typeof EditMessageSchema>;
