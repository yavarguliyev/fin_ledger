import { z } from 'zod';
import { DatabaseAdapter } from '@common/libs';

export const RetireRecoveryCodesSchema = z.object({
  userId: z.string({ message: 'User ID must be a string' }),

  adapter: z.custom<DatabaseAdapter>()
});

export type RetireRecoveryCodesDto = z.infer<typeof RetireRecoveryCodesSchema>;
