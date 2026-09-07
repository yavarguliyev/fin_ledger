import { z } from 'zod';

export const UserResponseSchema = z.object({
  id: z.string({ message: 'ID must be a string' }),

  email: z.string({ message: 'Email must be a string' }),

  displayName: z.string({ message: 'Display name must be a string' }),

  role: z.string({ message: 'Role must be a string' }),

  profileImagesKey: z.string({ message: 'Profile images key must be a string' }).nullable(),

  profileImages: z.array(z.string({ message: 'Each profile image must be a string' }), { message: 'Profile images must be an array' }),

  profileImageIndex: z.number({ message: 'Profile image index must be a number' }).int({ message: 'Profile image index must be an integer' }),

  walletId: z.string({ message: 'Wallet ID must be a string' }).nullable(),

  ledgerAccountId: z.string({ message: 'Ledger account ID must be a string' }).nullable(),

  lastLogin: z.iso.datetime({ message: 'Last login must be a valid ISO datetime' }).nullable(),

  isEmailVerified: z.boolean({ message: 'Is email verified must be a boolean' }),

  deletedAt: z.iso.datetime({ message: 'Deleted at must be a valid ISO datetime' }).nullable(),

  createdAt: z.iso.datetime({ message: 'Created at must be a valid ISO datetime' }),

  updatedAt: z.iso.datetime({ message: 'Updated at must be a valid ISO datetime' })
});

export type UserResponseDto = z.infer<typeof UserResponseSchema>;
