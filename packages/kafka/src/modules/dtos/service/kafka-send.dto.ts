import { z } from 'zod';
import type { IHeaders } from 'kafkajs';

export const KafkaSendSchema = z.object({
  topic: z.string({ message: 'Topic must be a string' }),

  payload: z.unknown(),

  key: z.string({ message: 'Key must be a string' }).nullable().optional(),

  headers: z.custom<IHeaders>().optional()
});

export type KafkaSendDto = z.infer<typeof KafkaSendSchema>;
