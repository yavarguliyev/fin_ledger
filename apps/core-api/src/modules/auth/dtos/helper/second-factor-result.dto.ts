import { z } from 'zod';

export const SecondFactorResultSchema = z.object({
  method: z.enum(['recovery_code', 'totp'], { message: 'Method must be recovery_code or totp' }),

  timeStep: z.number({ message: 'Time step must be a number' }).int().optional()
});

export type SecondFactorResultDto = z.infer<typeof SecondFactorResultSchema>;
