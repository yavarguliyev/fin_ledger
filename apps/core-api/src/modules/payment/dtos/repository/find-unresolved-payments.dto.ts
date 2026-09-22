import { z } from 'zod';

export const FindUnresolvedPaymentsSchema = z.object({
  minAttempts: z.number().int().positive(),

  limit: z.number().int().positive()
});

export type FindUnresolvedPaymentsDto = z.infer<typeof FindUnresolvedPaymentsSchema>;
