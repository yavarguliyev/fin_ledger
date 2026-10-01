import { z } from 'zod';
import { UserRoles, UserStatus } from '@common/libs';

export const SessionUserSchema = z.object({
  id: z.string({ message: 'ID must be a string' }),

  role: z.enum(Object.values(UserRoles) as [string, ...string[]], { message: 'Role must be a valid user role' }),

  status: z.enum(UserStatus, { message: 'Status must be a valid user status' }),

  passwordHash: z.string({ message: 'Password hash must be a string' }).optional(),

  createdAt: z.iso.datetime({ message: 'Created at must be a valid ISO datetime' }),

  updatedAt: z.iso.datetime({ message: 'Updated at must be a valid ISO datetime' }),

  email: z.string({ message: 'Email must be a string' }),

  displayName: z.string({ message: 'Display name must be a string' }),

  profileImagesKey: z.string({ message: 'Profile images key must be a string' }).nullable(),

  profileImages: z.array(z.string({ message: 'Each profile image must be a string' }), { message: 'Profile images must be an array' }),

  profileImageIndex: z.number({ message: 'Profile image index must be a number' }).int({ message: 'Profile image index must be an integer' }),

  lastLoginAt: z.iso.datetime({ message: 'Last login must be a valid ISO datetime' }).nullable(),

  lastLoginIp: z.string({ message: 'Last login IP must be a string' }).nullable().optional(),

  mfaEnabledAt: z.iso.datetime({ message: 'MFA enabled at must be a valid ISO datetime' }).nullable().optional(),

  selfExclusionUntil: z.iso.datetime({ message: 'Self exclusion until must be a valid ISO datetime' }).nullable().optional(),

  isEmailVerified: z.boolean({ message: 'Is email verified must be a boolean' }),

  emailVerifiedAt: z.iso.datetime({ message: 'Email verified at must be a valid ISO datetime' }).nullable().optional(),

  countryCode: z.string({ message: 'Country code must be a string' }).nullable().optional(),

  dateOfBirth: z.string({ message: 'Date of birth must be a string' }).nullable().optional(),

  kycStatus: z.string({ message: 'KYC status must be a string' }).optional(),

  deletedAt: z.iso.datetime({ message: 'Deleted at must be a valid ISO datetime' }).nullable()
});

export type SessionUserDto = z.infer<typeof SessionUserSchema>;
