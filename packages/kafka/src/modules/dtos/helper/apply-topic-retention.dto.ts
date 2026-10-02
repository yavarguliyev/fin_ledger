import { Logger } from '@nestjs/common';
import type { Kafka } from 'kafkajs';
import { z } from 'zod';

export const ApplyTopicRetentionSchema = z.object({
  kafka: z.custom<Kafka>(),
  topics: z.array(z.string()),
  retentionMs: z.number().int().positive(),
  logger: z.custom<Logger>()
});

export type ApplyTopicRetentionDto = z.infer<typeof ApplyTopicRetentionSchema>;
