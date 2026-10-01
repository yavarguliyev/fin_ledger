import { z } from 'zod';

export const MfaRecoveryCodeSchema = z.object({
  id: z.string({ message: 'ID must be a string' }),

  userId: z.string({ message: 'User ID must be a string' }),

  codeHash: z.string({ message: 'Code hash must be a string' }),

  usedAt: z.iso.datetime({ message: 'Used at must be a valid ISO datetime' }).nullable(),

  createdAt: z.iso.datetime({ message: 'Created at must be a valid ISO datetime' })
});

export type MfaRecoveryCodeDto = z.infer<typeof MfaRecoveryCodeSchema>;
