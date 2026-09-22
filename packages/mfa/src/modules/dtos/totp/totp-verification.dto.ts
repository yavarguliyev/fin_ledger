import { z } from 'zod';

export const TotpVerificationSchema = z.object({
  valid: z.boolean({ message: 'Valid must be a boolean' }),

  timeStep: z.number({ message: 'Time step must be a number' }).int().optional()
});

export type TotpVerificationDto = z.infer<typeof TotpVerificationSchema>;
