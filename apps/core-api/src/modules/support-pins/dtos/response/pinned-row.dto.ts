import { z } from 'zod';

export const PinnedRowSchema = z.object({
  messageId: z.string({ message: 'Message ID must be a string' })
});

export type PinnedRowDto = z.infer<typeof PinnedRowSchema>;
