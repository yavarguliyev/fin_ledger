import { z } from 'zod';

export const FindStalePaymentsSchema = z.object({
  updatedBefore: z.string({ message: 'Updated before must be an ISO timestamp' }),

  maxAttempts: z.number().int().positive(),

  limit: z.number().int().positive()
});

export type FindStalePaymentsDto = z.infer<typeof FindStalePaymentsSchema>;
