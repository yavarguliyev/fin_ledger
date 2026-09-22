import { z } from 'zod';
import { DatabaseAdapter } from '@common/libs';

export const ClaimRecoveryCodeSchema = z.object({
  userId: z.string({ message: 'User ID must be a string' }),

  codeHash: z.string({ message: 'Recovery code hash must be a string' }),

  adapter: z.custom<DatabaseAdapter>()
});

export type ClaimRecoveryCodeDto = z.infer<typeof ClaimRecoveryCodeSchema>;
