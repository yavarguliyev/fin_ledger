import { z } from 'zod';

export const VerifyEmailSchema = z.object({
  token: z.string({ message: 'Token must be a string' }).min(1, { message: 'Token is required' }),

  password: z
    .string({ message: 'Password must be a string' })
    .min(6, { message: 'Password must be at least 6 characters long' })
    .max(100, { message: 'Password must not exceed 100 characters' })
});

export type VerifyEmailDto = z.infer<typeof VerifyEmailSchema>;
