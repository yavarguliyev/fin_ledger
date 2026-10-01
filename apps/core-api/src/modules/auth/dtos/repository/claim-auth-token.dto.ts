import { z } from 'zod';
import { AuthTokenPurpose, DatabaseAdapter } from '@common/libs';

export const ClaimAuthTokenSchema = z.object({
  tokenHash: z.string({ message: 'Token hash must be a string' }),

  purposes: z.array(z.enum(AuthTokenPurpose, { message: 'Purpose must be a valid auth token purpose' }), { message: 'Purposes must be an array' }),

  adapter: z.custom<DatabaseAdapter>().optional()
});

export type ClaimAuthTokenDto = z.infer<typeof ClaimAuthTokenSchema>;
