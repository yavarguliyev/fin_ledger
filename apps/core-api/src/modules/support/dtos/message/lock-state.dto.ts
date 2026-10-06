import { z } from 'zod';

export const LockStateSchema = z.object({
  locked: z.boolean({ message: 'Locked must be a boolean' }),

  open: z.boolean({ message: 'Open must be a boolean' })
});

export type LockStateDto = z.infer<typeof LockStateSchema>;
