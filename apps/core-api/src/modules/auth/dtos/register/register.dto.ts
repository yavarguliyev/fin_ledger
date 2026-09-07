import { z } from 'zod';
import { UserRoles } from '@common/libs';

export const RegisterSchema = z.object({
  email: z
    .string({ message: 'Email must be a string' })
    .min(1, { message: 'Email is required' })
    .refine(val => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val), { message: 'Please provide a valid email address' }),

  role: z
    .enum(Object.values(UserRoles) as [string, ...string[]], { message: 'Role must be admin, user, or moderator' })
    .optional()
    .default(UserRoles.USER),

  password: z
    .string({ message: 'Password must be a string' })
    .min(6, { message: 'Password must be at least 6 characters long' })
    .max(100, { message: 'Password must not exceed 100 characters' }),

  displayName: z.string({ message: 'Display name must be a string' }).min(1, { message: 'Display name is required' }),

  passwordHash: z.string({ message: 'Password hash must be a string' }).optional()
});

export type RegisterDto = z.infer<typeof RegisterSchema>;
