import { z } from 'zod';
import { SupportMessageKind } from '@common/libs';

export const StoredAttachmentSchema = z.object({
  storageKey: z.string({ message: 'Storage key must be a string' }),

  fileName: z.string({ message: 'File name must be a string' }),

  mimeType: z.string({ message: 'Mime type must be a string' }),

  sizeBytes: z.number({ message: 'Size bytes must be a number' }).int().positive(),

  kind: z.enum(SupportMessageKind)
});

export type StoredAttachmentDto = z.infer<typeof StoredAttachmentSchema>;
