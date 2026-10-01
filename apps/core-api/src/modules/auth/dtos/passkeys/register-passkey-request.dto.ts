import { z } from 'zod';

import { WebAuthnResponseSchema } from './webauthn-response.dto';

export const RegisterPasskeyRequestSchema = z.object({
  response: WebAuthnResponseSchema,

  deviceLabel: z.string({ message: 'Device label must be a string' }).max(100, { message: 'Device label is too long' }).optional()
});

export type RegisterPasskeyRequestDto = z.infer<typeof RegisterPasskeyRequestSchema>;
