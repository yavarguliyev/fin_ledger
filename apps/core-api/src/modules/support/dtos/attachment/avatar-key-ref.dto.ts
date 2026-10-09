import { z } from 'zod';

export const AvatarKeyRefSchema = z.object({
  storageKey: z.string({ message: 'Storage key must be a string' }).nullable().optional()
});

export type AvatarKeyRefDto = z.infer<typeof AvatarKeyRefSchema>;
