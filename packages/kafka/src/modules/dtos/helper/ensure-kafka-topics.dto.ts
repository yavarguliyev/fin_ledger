import { z } from 'zod';
import { Logger } from '@nestjs/common';
import type { Kafka } from 'kafkajs';

export const EnsureKafkaTopicsSchema = z.object({
  kafka: z.custom<Kafka>(),

  topics: z.array(z.string()),

  logger: z.custom<Logger>()
});

export type EnsureKafkaTopicsDto = z.infer<typeof EnsureKafkaTopicsSchema>;
