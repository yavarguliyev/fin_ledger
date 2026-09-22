import { z } from 'zod';
import { DatabaseAdapter } from '@common/libs';

export const ReplaceRecoveryCodesSchema = z.object({
  userId: z.string({ message: 'User ID must be a string' }),

  hashes: z.array(z.string({ message: 'Recovery code hash must be a string' }), { message: 'Hashes must be an array' }),

  adapter: z.custom<DatabaseAdapter>()
});

export type ReplaceRecoveryCodesDto = z.infer<typeof ReplaceRecoveryCodesSchema>;
