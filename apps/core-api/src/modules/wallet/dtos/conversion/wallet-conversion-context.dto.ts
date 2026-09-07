import { z } from 'zod';

export const WalletConversionContextSchema = z.object({
  sourceAmountMinor: z.number({ message: 'Source amount must be a number' }).int({ message: 'Source amount must be an integer' }),

  sourceLedgerAccountId: z.string({ message: 'Source ledger account ID must be a string' }),

  targetLedgerAccountId: z.string({ message: 'Target ledger account ID must be a string' }),

  targetCurrency: z.string({ message: 'Target currency must be a string' }),

  targetAmountMinor: z.number({ message: 'Target amount must be a number' }).int({ message: 'Target amount must be an integer' })
});

export type WalletConversionContextDto = z.infer<typeof WalletConversionContextSchema>;
