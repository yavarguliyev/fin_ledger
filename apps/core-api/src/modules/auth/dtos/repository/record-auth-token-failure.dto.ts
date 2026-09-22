import { z } from 'zod';

export const RecordAuthTokenFailureSchema = z.object({
  tokenHash: z.string({ message: 'Token hash must be a string' }),

  maxAttempts: z.number({ message: 'Max attempts must be a number' }).int().positive()
});

export type RecordAuthTokenFailureDto = z.infer<typeof RecordAuthTokenFailureSchema>;
