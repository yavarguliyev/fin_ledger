import type { Message } from '@aws-sdk/client-sqs';
import { z } from 'zod';

import { QueueSubscriptionSchema } from './queue-subscription.dto';

export const QueueHandleSchema = z.object({
  subscription: QueueSubscriptionSchema,

  queueUrl: z.string({ message: 'Queue URL must be a string' }),

  message: z.custom<Message>()
});

export type QueueHandleDto = z.infer<typeof QueueHandleSchema>;
