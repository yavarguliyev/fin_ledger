import { z } from 'zod';
import { WalletTransactionType } from '@common/libs';

import { WalletSchema } from '../wallet/wallet.dto';
import { CurrencyLedgerDto, CurrencyLedgerSchema } from '../../../ledger/dtos/currency/currency-ledger.dto';
import { WalletTransactionRepository } from '../../../wallet-transactions/repositories/wallet-transaction.repository';

export const WalletTransactionParamsSchema = z.object({
  currency: z.string({ message: 'Currency must be a string' }),

  amountMinor: z.number({ message: 'Amount must be a number' }).int({ message: 'Amount must be an integer' }),

  dto: CurrencyLedgerSchema,

  type: z.enum(WalletTransactionType, { message: 'Transaction type must be a valid wallet transaction type' }),

  wallet: WalletSchema,

  ledgerEntryId: z.string({ message: 'Ledger entry ID must be a string' }),

  transactionId: z.string({ message: 'Transaction ID must be a string' })
});

export type WalletTransactionParamsDto = Omit<z.infer<typeof WalletTransactionParamsSchema>, 'dto'> & {
  dto: CurrencyLedgerDto;
  walletTransactionRepository: WalletTransactionRepository;
};
