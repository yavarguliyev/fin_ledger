import { z } from 'zod';

import { StorageFileSchema } from './storage-file.dto';

export const StorageFileRowSchema = StorageFileSchema.omit({ url: true }).extend({
  storageKey: z.string({ message: 'Storage key must be a string' })
});

export type StorageFileRowDto = z.infer<typeof StorageFileRowSchema>;
