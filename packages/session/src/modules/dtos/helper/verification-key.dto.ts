import { z } from 'zod';

import { SigningKeysSchema } from './signing-keys.dto';

export const VerificationKeySchema = SigningKeysSchema.extend({
  token: z.string({ message: 'Token must be a string' })
});

export type VerificationKeyDto = z.infer<typeof VerificationKeySchema>;
