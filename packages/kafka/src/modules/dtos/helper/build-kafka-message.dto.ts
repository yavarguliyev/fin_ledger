import { z } from 'zod';

import type { EachMessagePayload } from 'kafkajs';

export const BuildKafkaMessageSchema = z.object({
  topic: z.string({ message: 'Topic must be a string' }),

  partition: z.number({ message: 'Partition must be a number' }).int(),

  message: z.custom<EachMessagePayload['message']>()
});

export type BuildKafkaMessageDto = z.infer<typeof BuildKafkaMessageSchema>;
