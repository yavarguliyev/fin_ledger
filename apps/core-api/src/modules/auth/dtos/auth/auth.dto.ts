import { z } from 'zod';
import { UserRoles } from '@common/libs';

export const AuthSchema = z.object({
  id: z.string({ message: 'ID must be a string' }),

  passwordHash: z.string({ message: 'Password hash must be a string' }),

  createdAt: z.iso.datetime({ message: 'Created at must be a valid ISO datetime' }),

  updatedAt: z.iso.datetime({ message: 'Updated at must be a valid ISO datetime' }),

  lastLogin: z.iso.datetime({ message: 'Last login must be a valid ISO datetime' }).nullable(),

  isEmailVerified: z.boolean({ message: 'Is email verified must be a boolean' }),

  deletedAt: z.iso.datetime({ message: 'Deleted at must be a valid ISO datetime' }).nullable(),

  email: z.string({ message: 'Email must be a string' }),

  displayName: z.string({ message: 'Display name must be a string' }),

  profileImagesKey: z.string({ message: 'Profile images key must be a string' }).nullable(),

  profileImages: z.array(z.string({ message: 'Each profile image must be a string' }), { message: 'Profile images must be an array' }),

  profileImageIndex: z.number({ message: 'Profile image index must be a number' }).int({ message: 'Profile image index must be an integer' }),

  role: z.enum(Object.values(UserRoles) as [string, ...string[]], { message: 'Role must be a valid user role' }),

  walletId: z.string({ message: 'Wallet ID must be a string' }),

  ledgerAccountId: z.string({ message: 'Ledger account ID must be a string' }).optional()
});

export type AuthDto = z.infer<typeof AuthSchema>;

export type EmailVerificationTokenPayload = {
  userId: string;
  email: string;
  displayName: string;
  role: string;
  purpose: string;
};
