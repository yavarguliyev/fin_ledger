import { z } from 'zod';
import { WalletTransactionType } from '@common/libs';

import { LedgerService } from '../../../ledger/ledger.service';
import { WalletTransactionDto, WalletTransactionSchema } from '../../../wallet/dtos/transaction/wallet-transaction.dto';
import { WalletTransactionRepository } from '../../../wallet-transactions/repositories/wallet-transaction.repository';

export const CreateWalletTransactionParamsSchema = z.object({
  walletTransactionRepository: z.custom<WalletTransactionRepository>(),

  ledgerService: z.custom<LedgerService>(),

  input: WalletTransactionSchema,

  transactionType: z.enum(WalletTransactionType, { message: 'Transaction type must be a valid wallet transaction type' }),

  direction: z.enum(WalletTransactionType, { message: 'Direction must be a valid wallet transaction type' })
});

export type CreateWalletTransactionParamsDto = Omit<z.infer<typeof CreateWalletTransactionParamsSchema>, 'input'> & {
  input: WalletTransactionDto;
  walletTransactionRepository: WalletTransactionRepository;
  ledgerService: LedgerService;
};
