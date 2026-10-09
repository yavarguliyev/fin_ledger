import { z } from 'zod';

export const ClearChatRequestSchema = z.object({
  keepStarred: z.boolean({ message: 'Keep starred must be true or false' })
});

export type ClearChatRequestDto = z.infer<typeof ClearChatRequestSchema>;
