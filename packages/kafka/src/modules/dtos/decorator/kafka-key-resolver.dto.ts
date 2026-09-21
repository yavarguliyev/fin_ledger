import { z } from 'zod';

export const KafkaKeyResolverSchema = z.object({
  result: z.unknown(),

  args: z.array(z.unknown())
});

export type KafkaKeyResolverDto = z.infer<typeof KafkaKeyResolverSchema>;
