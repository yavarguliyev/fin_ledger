import { z } from 'zod';

export const TrialBalanceRowSchema = z.object({
  currency: z.string(),

  totalDebitsMinor: z.number().int(),

  totalCreditsMinor: z.number().int(),

  netMinor: z.number().int()
});

export type TrialBalanceRowDto = z.infer<typeof TrialBalanceRowSchema>;
