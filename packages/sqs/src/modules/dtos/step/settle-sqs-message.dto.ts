import type { Logger } from '@nestjs/common';
import type { Message, SQSClient } from '@aws-sdk/client-sqs';
import { z } from 'zod';

export const SettleSqsMessageSchema = z.object({
  client: z.custom<SQSClient>(),

  queueUrl: z.string({ message: 'Queue URL must be a string' }),

  queue: z.string({ message: 'Queue must be a string' }),

  message: z.custom<Message>(),

  logger: z.custom<Logger>()
});

export type SettleSqsMessageDto = z.infer<typeof SettleSqsMessageSchema>;
