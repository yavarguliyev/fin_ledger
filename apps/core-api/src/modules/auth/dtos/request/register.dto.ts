import { z } from 'zod';

import { PASSWORD_RULES } from '../../constants/validation/password-rules.constant';

export const RegisterSchema = z.object({
  email: z
    .string({ message: 'Email must be a string' })
    .min(1, { message: 'Email is required' })
    .refine(val => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val), { message: 'Please provide a valid email address' }),

  password: z
    .string({ message: 'Password must be a string' })
    .min(PASSWORD_RULES.MIN_LENGTH, { message: PASSWORD_RULES.LENGTH_MESSAGE })
    .max(PASSWORD_RULES.MAX_LENGTH, { message: PASSWORD_RULES.MAX_LENGTH_MESSAGE }),

  displayName: z.string({ message: 'Display name must be a string' }).min(1, { message: 'Display name is required' }),

  termsAccepted: z.literal(true, { message: 'You must accept the Terms and Privacy Policy' })
});

export type RegisterDto = z.infer<typeof RegisterSchema>;
