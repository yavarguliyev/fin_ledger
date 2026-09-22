import { z } from 'zod';

export const ChargeEventPayloadSchema = z.object({
  payload: z.record(z.string(), z.unknown())
});

export type ChargeEventPayloadDto = z.infer<typeof ChargeEventPayloadSchema>;
