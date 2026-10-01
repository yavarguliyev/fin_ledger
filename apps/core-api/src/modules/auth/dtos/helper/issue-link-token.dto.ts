import { z } from 'zod';
import { AuthTokenPurpose } from '@common/libs';

import { AuthTokenRepository } from '../../repositories/auth-token.repository';

export const IssueLinkTokenSchema = z.object({
  authTokenRepository: z.custom<AuthTokenRepository>(),

  userId: z.string({ message: 'User ID must be a string' }),

  purpose: z.enum(AuthTokenPurpose, { message: 'Purpose must be a valid auth token purpose' })
});

export type IssueLinkTokenDto = z.infer<typeof IssueLinkTokenSchema>;
