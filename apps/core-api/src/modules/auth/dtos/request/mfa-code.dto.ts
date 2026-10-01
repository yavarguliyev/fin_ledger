import { z } from 'zod';

export const MfaCodeSchema = z.object({
  code: z.string({ message: 'Code must be a string' }).trim().min(6, { message: 'Code is required' }).max(20, { message: 'Code is too long' })
});

export type MfaCodeDto = z.infer<typeof MfaCodeSchema>;
