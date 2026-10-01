import { z } from 'zod';

import { AuthTokenRepository } from '../../repositories/auth-token.repository';

export const RecordLinkTokenFailureSchema = z.object({
  authTokenRepository: z.custom<AuthTokenRepository>(),

  token: z.string({ message: 'Token must be a string' })
});

export type RecordLinkTokenFailureDto = z.infer<typeof RecordLinkTokenFailureSchema>;
