import { z } from 'zod';

import { CurrencyLedgerDto } from '../../../ledger/dtos/currency/currency-ledger.dto';
import { LedgerService } from '../../../ledger/ledger.service';
import { WalletTransactionRepository } from '../../../wallet-transactions/repositories/wallet-transaction.repository';

export const WalletCurrencyConversionParamsSchema = z.object({}).catchall(z.unknown());

export type WalletCurrencyConversionParamsDto = z.infer<typeof WalletCurrencyConversionParamsSchema> & {
  readonly walletTransactionRepository: WalletTransactionRepository;
  readonly dto: CurrencyLedgerDto;
  readonly ledgerService: LedgerService;
};
