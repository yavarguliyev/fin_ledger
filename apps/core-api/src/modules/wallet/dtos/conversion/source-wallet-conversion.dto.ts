import { z } from 'zod';

import { WalletSchema } from '../wallet/wallet.dto';
import { LedgerAccountSchema } from '../../../ledger/dtos/account/ledger-account.dto';

export const SourceWalletConversionSchema = z.object({
  wallet: WalletSchema,

  ledgerAccount: LedgerAccountSchema,

  amountMinor: z.number({ message: 'Amount must be a number' }).int({ message: 'Amount must be an integer' })
});

export type SourceWalletConversionDto = z.infer<typeof SourceWalletConversionSchema>;
