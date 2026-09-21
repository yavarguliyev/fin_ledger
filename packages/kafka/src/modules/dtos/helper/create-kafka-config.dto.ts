import { z } from 'zod';

export const CreateKafkaConfigSchema = z.object({
  clientId: z.string({ message: 'Client ID must be a string' }),

  brokers: z.array(z.string())
});

export type CreateKafkaConfigDto = z.infer<typeof CreateKafkaConfigSchema>;
