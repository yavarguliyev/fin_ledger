import { z } from 'zod';

export const LoginSchema = z.object({
  email: z
    .string({ message: 'Email must be a string' })
    .min(1, { message: 'Email is required' })
    .refine(val => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val), { message: 'Please provide a valid email address' }),

  password: z.string({ message: 'Password must be a string' }).min(6, { message: 'Password must be at least 6 characters long' })
});

export type LoginDto = z.infer<typeof LoginSchema>;
