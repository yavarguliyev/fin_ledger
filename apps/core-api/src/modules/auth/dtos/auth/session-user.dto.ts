import { z } from 'zod';
import { UserRoles } from '@common/libs';

export const SessionUserSchema = z.object({
  id: z.string({ message: 'ID must be a string' }),

  walletId: z.string({ message: 'Wallet ID must be a string' }),

  ledgerAccountId: z.string({ message: 'Ledger account ID must be a string' }).nullable(),

  role: z.enum(Object.values(UserRoles) as [string, ...string[]], { message: 'Role must be a valid user role' }),

  passwordHash: z.string({ message: 'Password hash must be a string' }).optional(),

  createdAt: z.iso.datetime({ message: 'Created at must be a valid ISO datetime' }),

  updatedAt: z.iso.datetime({ message: 'Updated at must be a valid ISO datetime' }),

  email: z.string({ message: 'Email must be a string' }),

  displayName: z.string({ message: 'Display name must be a string' }),

  profileImagesKey: z.string({ message: 'Profile images key must be a string' }).nullable(),

  profileImages: z.array(z.string({ message: 'Each profile image must be a string' }), { message: 'Profile images must be an array' }),

  profileImageIndex: z.number({ message: 'Profile image index must be a number' }).int({ message: 'Profile image index must be an integer' }),

  lastLogin: z.iso.datetime({ message: 'Last login must be a valid ISO datetime' }).nullable(),

  isEmailVerified: z.boolean({ message: 'Is email verified must be a boolean' }),

  deletedAt: z.iso.datetime({ message: 'Deleted at must be a valid ISO datetime' }).nullable()
});

export type SessionUserDto = z.infer<typeof SessionUserSchema>;
