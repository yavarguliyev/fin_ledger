import { z } from 'zod';
import { UploadFile } from '@common/libs';

export const StoreAttachmentSchema = z.object({
  conversationId: z.string({ message: 'Conversation ID must be a string' }),

  file: z.custom<UploadFile>()
});

export type StoreAttachmentDto = z.infer<typeof StoreAttachmentSchema>;
