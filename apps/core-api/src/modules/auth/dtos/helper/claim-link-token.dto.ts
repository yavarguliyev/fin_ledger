import { z } from 'zod';
import { AuthTokenPurpose, DatabaseAdapter } from '@common/libs';

import { AuthTokenRepository } from '../../repositories/auth-token.repository';

export const ClaimLinkTokenSchema = z.object({
  authTokenRepository: z.custom<AuthTokenRepository>(),

  token: z.string({ message: 'Token must be a string' }),

  purposes: z.array(z.enum(AuthTokenPurpose, { message: 'Purpose must be a valid auth token purpose' }), { message: 'Purposes must be an array' }),

  adapter: z.custom<DatabaseAdapter>().optional()
});

export type ClaimLinkTokenDto = z.infer<typeof ClaimLinkTokenSchema>;
