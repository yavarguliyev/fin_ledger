import { z } from 'zod';

export const RecoveryCodeSetSchema = z.object({
  codes: z.array(z.string({ message: 'Recovery code must be a string' })),

  hashes: z.array(z.string({ message: 'Recovery code hash must be a string' }))
});

export type RecoveryCodeSetDto = z.infer<typeof RecoveryCodeSetSchema>;
