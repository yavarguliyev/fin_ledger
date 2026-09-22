import { z } from 'zod';

export const RecoveryCodeSchema = z.object({
  code: z.string({ message: 'Recovery code must be a string' })
});

export type RecoveryCodeDto = z.infer<typeof RecoveryCodeSchema>;
