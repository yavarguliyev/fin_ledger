import { z } from 'zod';
import type { KafkaMessage } from 'kafkajs';

export const KafkaMessageRefSchema = z.object({ message: z.custom<KafkaMessage>() });

export type KafkaMessageRefDto = z.infer<typeof KafkaMessageRefSchema>;
