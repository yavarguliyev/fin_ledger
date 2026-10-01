import { z } from 'zod';
import type { EachMessagePayload } from 'kafkajs';

export const KafkaPayloadRefSchema = z.object({ payload: z.custom<EachMessagePayload>() });

export type KafkaPayloadRefDto = z.infer<typeof KafkaPayloadRefSchema>;
