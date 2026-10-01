import { z } from 'zod';

export const MfaRecoveryCodesResponseSchema = z.object({
  recoveryCodes: z.array(z.string({ message: 'Recovery code must be a string' }), { message: 'Recovery codes must be an array' })
});

export type MfaRecoveryCodesResponseDto = z.infer<typeof MfaRecoveryCodesResponseSchema>;
