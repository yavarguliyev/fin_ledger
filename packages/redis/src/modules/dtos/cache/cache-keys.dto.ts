import { z } from 'zod';

export const CacheKeysSchema = z.object({ keys: z.array(z.string({ message: 'Key must be a string' })) });

export type CacheKeysDto = z.infer<typeof CacheKeysSchema>;
