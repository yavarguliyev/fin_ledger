import { z } from 'zod';

export const LedgerIntegrityReportSchema = z.object({
  checkedAt: z.string(),

  driftedAccounts: z.number().int().nonnegative(),

  driftedWallets: z.number().int().nonnegative(),

  unbalancedCurrencies: z.array(z.string()),

  healthy: z.boolean()
});

export type LedgerIntegrityReportDto = z.infer<typeof LedgerIntegrityReportSchema>;
