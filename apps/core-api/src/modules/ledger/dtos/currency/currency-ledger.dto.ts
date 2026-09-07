import { z } from 'zod';
import { DatabaseAdapter } from '@common/libs';

import { WalletSchema } from '../../../wallet/dtos/wallet/wallet.dto';
import { CurrencyConversionResponseSchema } from '../../../wallet-currency-conversion/dtos/conversion/currency-conversion.response.dto';

export const CurrencyLedgerSchema = z.object({
  sourceWallet: WalletSchema,

  targetWallet: WalletSchema,

  conversion: CurrencyConversionResponseSchema,

  sourceAmountMinor: z.number({ message: 'Source amount must be a number' }).int({ message: 'Source amount must be an integer' }),

  sourceLedgerAccountId: z.string({ message: 'Source ledger account ID must be a string' }),

  targetLedgerAccountId: z.string({ message: 'Target ledger account ID must be a string' }),

  targetCurrency: z.string({ message: 'Target currency must be a string' }),

  targetAmountMinor: z.number({ message: 'Target amount must be a number' }).int({ message: 'Target amount must be an integer' })
});

export type CurrencyLedgerDto = z.infer<typeof CurrencyLedgerSchema> & { tx: DatabaseAdapter };
