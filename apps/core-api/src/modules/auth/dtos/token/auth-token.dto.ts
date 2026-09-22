import { z } from 'zod';
import { AuthTokenPurpose } from '@common/libs';

export const AuthTokenSchema = z.object({
  id: z.string({ message: 'ID must be a string' }),

  userId: z.string({ message: 'User ID must be a string' }),

  purpose: z.enum(AuthTokenPurpose, { message: 'Purpose must be a valid auth token purpose' }),

  tokenHash: z.string({ message: 'Token hash must be a string' }),

  expiresAt: z.iso.datetime({ message: 'Expires at must be a valid ISO datetime' }),

  usedAt: z.iso.datetime({ message: 'Used at must be a valid ISO datetime' }).nullable(),

  revokedAt: z.iso.datetime({ message: 'Revoked at must be a valid ISO datetime' }).nullable(),

  createdAt: z.iso.datetime({ message: 'Created at must be a valid ISO datetime' })
});

export type AuthTokenDto = z.infer<typeof AuthTokenSchema>;
