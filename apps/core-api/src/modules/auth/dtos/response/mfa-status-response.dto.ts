import { z } from 'zod';

export const MfaStatusResponseSchema = z.object({
  enabled: z.boolean({ message: 'Enabled must be a boolean' }),

  pending: z.boolean({ message: 'Pending must be a boolean' })
});

export type MfaStatusResponseDto = z.infer<typeof MfaStatusResponseSchema>;
