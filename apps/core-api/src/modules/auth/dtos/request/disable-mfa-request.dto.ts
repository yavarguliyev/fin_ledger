import { z } from 'zod';

import { MfaCodeSchema } from './mfa-code.dto';

export const DisableMfaRequestSchema = MfaCodeSchema.extend({
  password: z.string({ message: 'Password must be a string' }).min(1, { message: 'Password is required' })
});

export type DisableMfaRequestDto = z.infer<typeof DisableMfaRequestSchema>;
