import { z } from 'zod';

import { WebAuthnResponseSchema } from './webauthn-response.dto';

export const VerifyPasskeyLoginSchema = z.object({
  owner: z.string({ message: 'Owner must be a string' }).min(1, { message: 'Owner is required' }),

  response: WebAuthnResponseSchema
});

export type VerifyPasskeyLoginDto = z.infer<typeof VerifyPasskeyLoginSchema>;
