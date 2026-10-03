import { z } from 'zod';

export const EmojiValueSchema = z.object({
  value: z.string()
});

export type EmojiValueDto = z.infer<typeof EmojiValueSchema>;
