import { z } from 'zod';

export const PasswordHashSchema = z.object({
  passwordHash: z.string({ message: 'Password hash must be a string' })
});

export type PasswordHashDto = z.infer<typeof PasswordHashSchema>;
