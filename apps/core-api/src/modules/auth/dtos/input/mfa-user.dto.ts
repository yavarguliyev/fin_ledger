import { z } from 'zod';

export const MfaUserSchema = z.object({
  userId: z.string({ message: 'User ID must be a string' })
});

export type MfaUserDto = z.infer<typeof MfaUserSchema>;
