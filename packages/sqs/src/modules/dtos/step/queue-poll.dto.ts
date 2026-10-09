import { z } from 'zod';

import { QueueSubscriptionSchema } from './queue-subscription.dto';

export const QueuePollSchema = z.object({
  subscription: QueueSubscriptionSchema,

  queueUrl: z.string({ message: 'Queue URL must be a string' }),

  signal: z.custom<AbortSignal>()
});

export type QueuePollDto = z.infer<typeof QueuePollSchema>;
