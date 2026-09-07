import { z } from 'zod';
import { UserRoles } from '@common/libs';

export const UserCreateSchema = z.object({
  email: z
    .string({ message: 'Email must be a string' })
    .min(1, { message: 'Email is required' })
    .refine(val => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val), { message: 'Please provide a valid email address' }),

  displayName: z.string({ message: 'Display name must be a string' }).min(1, { message: 'Display name is required' }),

  role: z.enum([UserRoles.ADMIN, UserRoles.MODERATOR], { message: 'Role must be admin or moderator' })
});

export type UserCreateDto = z.infer<typeof UserCreateSchema>;

export type UserCreateResponse = { success: boolean; message: string; token?: string };
