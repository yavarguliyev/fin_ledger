import { z } from 'zod';

import { WebAuthnResponseSchema } from './webauthn-response.dto';

export const StepUpRequestSchema = z.object({ response: WebAuthnResponseSchema });

export type StepUpRequestDto = z.infer<typeof StepUpRequestSchema>;
