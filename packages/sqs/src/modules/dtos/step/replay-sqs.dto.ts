import type { Logger } from '@nestjs/common';
import type { SQSClient } from '@aws-sdk/client-sqs';
import { z } from 'zod';

export const ReplaySqsSchema = z.object({
  client: z.custom<SQSClient>(),

  sourceUrl: z.string({ message: 'Source URL must be a string' }),

  targetUrl: z.string({ message: 'Target URL must be a string' }),

  limit: z.number({ message: 'Limit must be a number' }).int().positive(),

  logger: z.custom<Logger>()
});

export type ReplaySqsDto = z.infer<typeof ReplaySqsSchema>;
