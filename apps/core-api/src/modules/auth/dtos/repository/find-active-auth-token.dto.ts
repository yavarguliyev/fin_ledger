import { z } from 'zod';
import { AuthTokenPurpose } from '@common/libs';

export const FindActiveAuthTokenSchema = z.object({
  tokenHash: z.string({ message: 'Token hash must be a string' }),

  purposes: z.array(z.enum(AuthTokenPurpose, { message: 'Purpose must be a valid auth token purpose' }), { message: 'Purposes must be an array' })
});

export type FindActiveAuthTokenDto = z.infer<typeof FindActiveAuthTokenSchema>;
