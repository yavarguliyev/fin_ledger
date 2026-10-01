import { z } from 'zod';
import { AuthTokenPurpose } from '@common/libs';

export const ClaimedAuthTokenSchema = z.object({
  userId: z.string({ message: 'User ID must be a string' }),

  purpose: z.enum(AuthTokenPurpose, { message: 'Purpose must be a valid auth token purpose' })
});

export type ClaimedAuthTokenDto = z.infer<typeof ClaimedAuthTokenSchema>;
