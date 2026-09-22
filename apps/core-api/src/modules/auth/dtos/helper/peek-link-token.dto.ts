import { z } from 'zod';
import { AuthTokenPurpose } from '@common/libs';

import { AuthTokenRepository } from '../../repositories/auth-token.repository';

export const PeekLinkTokenSchema = z.object({
  authTokenRepository: z.custom<AuthTokenRepository>(),

  token: z.string({ message: 'Token must be a string' }),

  purposes: z.array(z.enum(AuthTokenPurpose, { message: 'Purpose must be a valid auth token purpose' }), { message: 'Purposes must be an array' })
});

export type PeekLinkTokenDto = z.infer<typeof PeekLinkTokenSchema>;
