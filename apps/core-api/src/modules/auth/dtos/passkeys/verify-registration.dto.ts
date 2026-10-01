import { z } from 'zod';

import { WebAuthnResponseSchema } from './webauthn-response.dto';

export const VerifyRegistrationSchema = z.object({
  userId: z.string({ message: 'User ID must be a string' }),

  response: WebAuthnResponseSchema,

  deviceLabel: z.string({ message: 'Device label must be a string' }).optional()
});

export type VerifyRegistrationDto = z.infer<typeof VerifyRegistrationSchema>;
