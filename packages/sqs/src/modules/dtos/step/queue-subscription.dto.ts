import { z } from 'zod';

import { RawQueueMessageDto } from './raw-queue-message.dto';

export const QueueSubscriptionSchema = z.object({
  queueName: z.string({ message: 'Queue name must be a string' }),

  handler: z.custom<(message: RawQueueMessageDto) => Promise<void>>()
});

export type QueueSubscriptionDto = z.infer<typeof QueueSubscriptionSchema>;
