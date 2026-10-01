import { z } from 'zod';

export const StorageKeyRefSchema = z.object({ storageKey: z.string({ message: 'Storage key must be a string' }) });

export type StorageKeyRefDto = z.infer<typeof StorageKeyRefSchema>;
