import { z } from 'zod';

import { MfaCodeSchema } from './mfa-code.dto';

export const VerifyMfaLoginSchema = MfaCodeSchema.extend({
  challengeToken: z.string({ message: 'Challenge token must be a string' }).min(1, { message: 'Challenge token is required' })
});

export type VerifyMfaLoginDto = z.infer<typeof VerifyMfaLoginSchema>;
