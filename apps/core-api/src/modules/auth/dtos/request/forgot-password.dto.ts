import { z } from 'zod';

export const ForgotPasswordSchema = z.object({
  email: z
    .string({ message: 'Email must be a string' })
    .min(1, { message: 'Email is required' })
    .refine(val => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val), { message: 'Please provide a valid email address' })
});

export type ForgotPasswordDto = z.infer<typeof ForgotPasswordSchema>;
