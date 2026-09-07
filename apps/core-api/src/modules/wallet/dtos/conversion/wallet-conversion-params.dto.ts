import { z } from 'zod';
import { DatabaseAdapter } from '@common/libs';

import { SourceWalletConversionSchema } from './source-wallet-conversion.dto';
import { WalletRepository } from '../../repositories/wallet.repository';
import { LedgerAccountRepository } from '../../../ledger/repositories/ledger-account.repository';

export const WalletConversionParamsSchema = z.object({
  source: SourceWalletConversionSchema,

  targetCurrency: z.string({ message: 'Target currency must be a string' }),

  targetAmountMinor: z.number({ message: 'Target amount must be a number' }).int({ message: 'Target amount must be an integer' })
});

export type WalletConversionParamsDto = z.infer<typeof WalletConversionParamsSchema> & { tx: DatabaseAdapter };

export type WalletConversionParams = WalletConversionParamsDto & {
  walletRepository: WalletRepository;
  ledgerAccountRepository: LedgerAccountRepository;
};
