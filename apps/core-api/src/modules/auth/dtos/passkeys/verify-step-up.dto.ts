import { z } from 'zod';

import { WebAuthnResponseSchema } from './webauthn-response.dto';

export const VerifyStepUpSchema = z.object({
  userId: z.string({ message: 'User ID must be a string' }),

  response: WebAuthnResponseSchema
});

export type VerifyStepUpDto = z.infer<typeof VerifyStepUpSchema>;
