import { z } from 'zod';

import { ConfirmSetupSessionRequestSchema } from '../request/confirm-setup-session-request.dto';

export const ConfirmSetupSessionSchema = ConfirmSetupSessionRequestSchema.extend({
  userId: z.string({ message: 'User ID must be a string' }).min(1, { message: 'User ID is required' })
});

export type ConfirmSetupSessionDto = z.infer<typeof ConfirmSetupSessionSchema>;
