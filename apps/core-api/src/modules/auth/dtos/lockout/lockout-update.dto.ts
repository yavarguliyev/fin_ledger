import { z } from 'zod';

export const LockoutUpdateSchema = z.object({
  failedLoginAttempts: z.number({ message: 'Failed login attempts must be a number' }).int(),

  lockedUntil: z.string({ message: 'Locked until must be a string' }).nullable()
});

export type LockoutUpdateDto = z.infer<typeof LockoutUpdateSchema>;
