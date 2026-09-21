import { z } from 'zod';

export const KafkaSubscribeOptionsSchema = z.object({
  topic: z.custom<string | RegExp>(),

  fromBeginning: z.boolean().optional()
});

export type KafkaSubscribeOptionsDto = z.infer<typeof KafkaSubscribeOptionsSchema>;
