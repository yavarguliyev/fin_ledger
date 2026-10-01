import { z } from 'zod';

export const WebAuthnResponseSchema = z.object({
  id: z.string({ message: 'Credential ID must be a string' }).min(1, { message: 'Credential ID is required' }),

  rawId: z.string({ message: 'Raw ID must be a string' }).min(1, { message: 'Raw ID is required' }),

  type: z.string({ message: 'Type must be a string' }),

  response: z.record(z.string(), z.unknown(), { message: 'Response must be an object' }),

  clientExtensionResults: z.record(z.string(), z.unknown(), { message: 'Client extension results must be an object' }),

  authenticatorAttachment: z.string({ message: 'Authenticator attachment must be a string' }).optional()
});

export type WebAuthnResponseDto = z.infer<typeof WebAuthnResponseSchema>;
