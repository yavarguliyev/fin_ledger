import { z } from 'zod';
import { TOKEN_TYPES, UserRoles } from '@common/libs';

export const AuthResponseSchema = z.object({
  accessToken: z.string({ message: 'Access token must be a string' }),

  expiresIn: z.number({ message: 'Expires in must be a number' }),

  tokenType: z.enum(TOKEN_TYPES, { message: 'Token type must be a valid token type' }),

  user: z.object({
    id: z.string({ message: 'ID must be a string' }),

    email: z.string({ message: 'Email must be a string' }),

    displayName: z.string({ message: 'Display name must be a string' }),

    profileImagesKey: z.string({ message: 'Profile images key must be a string' }).nullable(),

    profileImages: z.array(z.string({ message: 'Each profile image must be a string' }), { message: 'Profile images must be an array' }),

    profileImageIndex: z.number({ message: 'Profile image index must be a number' }).int({ message: 'Profile image index must be an integer' }),

    role: z.enum(Object.values(UserRoles) as [string, ...string[]], { message: 'Role must be a valid user role' }),

    walletId: z.string({ message: 'Wallet ID must be a string' }),

    ledgerAccountId: z.string({ message: 'Ledger account ID must be a string' }).nullable()
  })
});

export type AuthResponseDto = z.infer<typeof AuthResponseSchema>;
