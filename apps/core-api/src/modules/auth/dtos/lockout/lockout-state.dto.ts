import { z } from 'zod';

export const LockoutStateSchema = z.object({
  failedLoginAttempts: z.number({ message: 'Failed login attempts must be a number' }).int().optional(),

  lockedUntil: z.string({ message: 'Locked until must be a string' }).nullable().optional()
});

export type LockoutStateDto = z.infer<typeof LockoutStateSchema>;
