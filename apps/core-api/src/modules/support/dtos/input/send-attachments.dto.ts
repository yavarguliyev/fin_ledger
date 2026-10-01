import { z } from 'zod';
import { UploadFile } from '@common/libs';

export const SendAttachmentsSchema = z.object({
  conversationId: z.string({ message: 'Conversation ID must be a string' }).min(1, { message: 'Conversation ID is required' }),

  senderUserId: z.string({ message: 'Sender user ID must be a string' }).min(1, { message: 'Sender user ID is required' }),

  role: z.string({ message: 'Role must be a string' }),

  body: z.string({ message: 'Body must be a string' }).optional(),

  durationSeconds: z.number({ message: 'Duration must be a number' }).int().positive().optional(),

  files: z.array(z.custom<UploadFile>())
});

export type SendAttachmentsDto = z.infer<typeof SendAttachmentsSchema>;
