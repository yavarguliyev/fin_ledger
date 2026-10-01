import type { EachMessagePayload } from 'kafkajs';
import { z } from 'zod';

export const KafkaMessagePayloadSchema = z.object({ payload: z.custom<EachMessagePayload>() });

export type KafkaMessagePayloadDto = z.infer<typeof KafkaMessagePayloadSchema>;
