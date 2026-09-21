import { z } from 'zod';

import type { KafkaKeyResolverDto } from './kafka-key-resolver.dto';

export const KafkaPublishOptionsSchema = z.object({
  topic: z.string({ message: 'Topic must be a string' }),

  key: z.custom<string | ((dto: KafkaKeyResolverDto) => string)>().optional()
});

export type KafkaPublishOptionsDto = z.infer<typeof KafkaPublishOptionsSchema>;
