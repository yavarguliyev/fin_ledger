import { z } from 'zod';

import { SettleSqsMessageSchema } from './settle-sqs-message.dto';

export const FailedSqsMessageSchema = SettleSqsMessageSchema.extend({
  lastError: z.string({ message: 'Last error must be a string' })
});

export type FailedSqsMessageDto = z.infer<typeof FailedSqsMessageSchema>;
