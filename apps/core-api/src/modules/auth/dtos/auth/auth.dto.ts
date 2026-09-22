import { z } from 'zod';
import { PasswordAlgorithm, UserRoles, UserStatus } from '@common/libs';

export const AuthSchema = z.object({
  id: z.string({ message: 'ID must be a string' }),

  passwordHash: z.string({ message: 'Password hash must be a string' }),

  passwordAlgo: z.enum(PasswordAlgorithm, { message: 'Password algorithm must be argon2id or bcrypt' }),

  passwordChangedAt: z.iso.datetime({ message: 'Password changed at must be a valid ISO datetime' }).nullable(),

  createdAt: z.iso.datetime({ message: 'Created at must be a valid ISO datetime' }),

  updatedAt: z.iso.datetime({ message: 'Updated at must be a valid ISO datetime' }),

  lastLoginAt: z.iso.datetime({ message: 'Last login must be a valid ISO datetime' }).nullable(),

  isEmailVerified: z.boolean({ message: 'Is email verified must be a boolean' }),

  emailVerifiedAt: z.iso.datetime({ message: 'Email verified at must be a valid ISO datetime' }).nullable(),

  termsAcceptedAt: z.iso.datetime({ message: 'Terms accepted at must be a valid ISO datetime' }).nullable(),

  mfaSecretEncrypted: z.custom<Buffer>().nullable(),

  mfaEnabledAt: z.iso.datetime({ message: 'MFA enabled at must be a valid ISO datetime' }).nullable(),

  mfaLastUsedStep: z.number({ message: 'MFA last used step must be a number' }).int().nullable(),

  deletedAt: z.iso.datetime({ message: 'Deleted at must be a valid ISO datetime' }).nullable(),

  email: z.string({ message: 'Email must be a string' }),

  displayName: z.string({ message: 'Display name must be a string' }),

  profileImagesKey: z.string({ message: 'Profile images key must be a string' }).nullable(),

  profileImages: z.array(z.string({ message: 'Each profile image must be a string' }), { message: 'Profile images must be an array' }),

  profileImageIndex: z.number({ message: 'Profile image index must be a number' }).int({ message: 'Profile image index must be an integer' }),

  role: z.enum(Object.values(UserRoles) as [string, ...string[]], { message: 'Role must be a valid user role' }),

  status: z.enum(UserStatus, { message: 'Status must be a valid user status' })
});

export type AuthDto = z.infer<typeof AuthSchema>;
