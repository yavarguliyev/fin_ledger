import { z } from 'zod';

import { KafkaSubscriberMetadataRecord } from '../../interfaces/kafka-subscriber-metadata-record.interface';

export const RegisterSubscriberSchema = z.object({
  instance: z.custom<object>(),

  methodName: z.custom<string | symbol>(),

  options: z.custom<KafkaSubscriberMetadataRecord['options']>()
});

export type RegisterSubscriberDto = z.infer<typeof RegisterSubscriberSchema>;
