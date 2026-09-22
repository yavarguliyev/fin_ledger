import { z } from 'zod';

import { AuthResponseSchema } from './auth-response.dto';
import { MfaChallengeResponseSchema } from './mfa-challenge-response.dto';

export const LoginResponseSchema = z.union([AuthResponseSchema, MfaChallengeResponseSchema]);

export type LoginResponseDto = z.infer<typeof LoginResponseSchema>;
