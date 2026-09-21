import { z } from 'zod';

export const KafkaPublishSchema = z.object({
  payload: z.record(z.string(), z.unknown(), { message: 'Payload must be an object' }),

  topic: z.string({ message: 'Topic must be a string' }),

  key: z.string({ message: 'Key must be a string' }).optional()
});

export type KafkaPublishDto = z.infer<typeof KafkaPublishSchema>;
