import { z } from 'zod';
import type { EachMessagePayload } from 'kafkajs';

export const KafkaMessagePayloadSchema = z.object({
  payload: z.custom<EachMessagePayload>()
});

export type KafkaMessagePayloadDto = z.infer<typeof KafkaMessagePayloadSchema>;
