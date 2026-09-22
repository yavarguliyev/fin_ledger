import { z } from 'zod';
import { DatabaseAdapter, UserRoles } from '@common/libs';

export const CreateAuthUserSchema = z.object({
  email: z.string({ message: 'Email must be a string' }),

  passwordHash: z.string({ message: 'Password hash must be a string' }),

  role: z.enum(UserRoles, { message: 'Role must be a valid user role' }),

  displayName: z.string({ message: 'Display name must be a string' }),

  termsAcceptedAt: z.iso.datetime({ message: 'Terms accepted at must be a valid ISO datetime' }),

  adapter: z.custom<DatabaseAdapter>().optional()
});

export type CreateAuthUserDto = z.infer<typeof CreateAuthUserSchema>;
