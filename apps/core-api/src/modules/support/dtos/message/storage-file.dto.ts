import { z } from 'zod';

import { SUPPORT_MESSAGE_KINDS } from '@common/contracts';

export const StorageFileSchema = z.object({
  messageId: z.string({ message: 'Message ID must be a string' }),

  kind: z.enum(SUPPORT_MESSAGE_KINDS, { message: 'Kind must be a valid message kind' }),

  fileName: z.string({ message: 'File name must be a string' }).nullable(),

  mimeType: z.string({ message: 'Mime type must be a string' }).nullable(),

  sizeBytes: z.number({ message: 'Size bytes must be a number' }),

  createdAt: z.date({ message: 'Created at must be a date' }),

  mine: z.boolean({ message: 'Mine must be a boolean' })
});

export type StorageFileDto = z.infer<typeof StorageFileSchema>;
