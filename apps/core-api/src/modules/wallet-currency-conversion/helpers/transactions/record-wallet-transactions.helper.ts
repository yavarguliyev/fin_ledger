import { InternalServerErrorException } from '@nestjs/common';
import { WalletTransactionType, WalletTransactionStatus } from '@common/libs';

import { CreateWalletTransactionParamsDto } from '../../dtos/transaction/wallet-transaction-params-create.dto';
import { createLedgerEntries } from '../../../ledger/helpers/create-ledger-entries.helper';

export const recordWalletTransactions = async (options: CreateWalletTransactionParamsDto): Promise<void> => {
  const { input, ledgerService, walletTransactionRepository, transactionType, direction } = options;
  const { wallet, amountMinor, reference, adapter, transactionId } = input;

  const systemAccountId = await ledgerService.getOrCreateSystemAccount(wallet.currency, adapter);
  const referenceValue = reference ?? transactionId;
  const isDebit = direction === WalletTransactionType.DEBIT;

  const entries = createLedgerEntries({ wallet, systemAccountId, amountMinor, referenceValue, isDebit });
  const ledgerEntries = await ledgerService.createTransaction(entries, adapter);
  const firstEntry = ledgerEntries[0];

  if (!firstEntry) throw new InternalServerErrorException('Failed to create ledger entries');

  await walletTransactionRepository.createTransaction({
    walletId: wallet.id,
    type: transactionType,
    amountMinor,
    currency: wallet.currency,
    transactionId: transactionId!,
    ...(reference && { reference }),
    ledgerEntryId: firstEntry.id,
    status: WalletTransactionStatus.COMPLETED,
    adapter: adapter!
  });
};
