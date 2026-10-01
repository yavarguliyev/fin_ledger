import { z } from 'zod';

export const PasskeyRegisteredSchema = z.object({
  verified: z.boolean({ message: 'Verified must be a boolean' }),

  credentialId: z.string({ message: 'Credential ID must be a string' })
});

export type PasskeyRegisteredDto = z.infer<typeof PasskeyRegisteredSchema>;
