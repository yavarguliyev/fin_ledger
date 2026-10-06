import { z } from 'zod';

export const LockResponseSchema = z.object({
  locked: z.boolean({ message: 'Locked must be a boolean' }),

  open: z.boolean({ message: 'Open must be a boolean' })
});

export type LockResponseDto = z.infer<typeof LockResponseSchema>;
