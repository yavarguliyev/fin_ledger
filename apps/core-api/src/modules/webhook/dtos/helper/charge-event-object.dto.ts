import { z } from 'zod';

export const ChargeEventObjectSchema = z.object({
  object: z.record(z.string(), z.unknown())
});

export type ChargeEventObjectDto = z.infer<typeof ChargeEventObjectSchema>;
