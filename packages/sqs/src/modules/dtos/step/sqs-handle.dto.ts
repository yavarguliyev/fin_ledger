import type { Message } from '@aws-sdk/client-sqs';
import { z } from 'zod';
import { BrokerSubscribeSchema } from '@common/messaging';

export const SqsHandleSchema = z.object({
  subscription: BrokerSubscribeSchema,

  queueUrl: z.string({ message: 'Queue URL must be a string' }),

  message: z.custom<Message>()
});

export type SqsHandleDto = z.infer<typeof SqsHandleSchema>;
