import { z } from 'zod';
import { AuthTokenPurpose } from '@common/libs';

export const IssueAuthTokenSchema = z.object({
  userId: z.string({ message: 'User ID must be a string' }),

  purpose: z.enum(AuthTokenPurpose, { message: 'Purpose must be a valid auth token purpose' }),

  tokenHash: z.string({ message: 'Token hash must be a string' }),

  expiresAt: z.iso.datetime({ message: 'Expires at must be a valid ISO datetime' })
});

export type IssueAuthTokenDto = z.infer<typeof IssueAuthTokenSchema>;
