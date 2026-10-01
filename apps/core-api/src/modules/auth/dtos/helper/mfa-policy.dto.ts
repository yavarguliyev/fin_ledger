import { z } from 'zod';

export const MfaPolicySchema = z.object({
  role: z.string({ message: 'Role must be a string' }).optional(),

  mfaEnabledAt: z.string({ message: 'MFA enabled at must be a string' }).nullable().optional()
});

export type MfaPolicyDto = z.infer<typeof MfaPolicySchema>;
