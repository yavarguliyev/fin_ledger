import { z } from 'zod';

export const RegisterSchema = z.object({
  email: z
    .string({ message: 'Email must be a string' })
    .min(1, { message: 'Email is required' })
    .refine(val => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val), { message: 'Please provide a valid email address' }),

  password: z
    .string({ message: 'Password must be a string' })
    .min(6, { message: 'Password must be at least 6 characters long' })
    .max(100, { message: 'Password must not exceed 100 characters' }),

  displayName: z.string({ message: 'Display name must be a string' }).min(1, { message: 'Display name is required' }),

  termsAccepted: z.literal(true, { message: 'You must accept the Terms and Privacy Policy' })
});

export type RegisterDto = z.infer<typeof RegisterSchema>;
