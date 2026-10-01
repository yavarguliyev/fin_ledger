import { z } from 'zod';

export const MfaChallengeResponseSchema = z.object({
  mfaRequired: z.literal(true, { message: 'MFA required must be true' }),

  challengeToken: z.string({ message: 'Challenge token must be a string' })
});

export type MfaChallengeResponseDto = z.infer<typeof MfaChallengeResponseSchema>;
