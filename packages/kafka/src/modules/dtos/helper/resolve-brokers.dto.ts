import { z } from 'zod';

export const ResolveBrokersSchema = z.object({
  brokers: z.string().optional(),

  host: z.string().optional(),

  port: z.number().optional()
});

export type ResolveBrokersDto = z.infer<typeof ResolveBrokersSchema>;
