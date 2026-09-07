import { WalletTransactionType } from '@common/libs';

import { WalletCurrencyConversionParamsDto } from '../../../wallet/dtos/conversion/wallet-currency-conversion.params.dto';
import { createConversionEntry } from '../entries/create-conversion-entry.helper';
import { createWalletTransaction } from '../transactions/create-wallet-transaction.helper';

export const recordWalletCurrencyConversion = async (options: WalletCurrencyConversionParamsDto): Promise<void> => {
  const { dto, ledgerService, walletTransactionRepository } = options;

  const [sourceSystemAccountId, targetSystemAccountId] = await Promise.all([
    ledgerService.getOrCreateSystemAccount(dto.sourceWallet.currency, dto.tx),
    ledgerService.getOrCreateSystemAccount(dto.targetWallet.currency, dto.tx)
  ]);

  const [sourceEntryId, targetEntryId] = await Promise.all([
    createConversionEntry({ dto, systemAccountId: sourceSystemAccountId, ledgerService, direction: 'source' }),
    createConversionEntry({ dto, systemAccountId: targetSystemAccountId, ledgerService, direction: 'target' })
  ]);

  const transactions = [
    {
      wallet: dto.sourceWallet,
      type: WalletTransactionType.CONVERSION_OUT,
      amountMinor: dto.sourceAmountMinor,
      transactionId: dto.conversion.id,
      ledgerEntryId: sourceEntryId,
      currency: dto.sourceWallet.currency
    },
    {
      wallet: dto.targetWallet,
      type: WalletTransactionType.CONVERSION_IN,
      amountMinor: dto.targetAmountMinor,
      transactionId: `${dto.conversion.id}-target`,
      ledgerEntryId: targetEntryId,
      currency: dto.targetCurrency
    }
  ];

  await Promise.all(transactions.map(transaction => createWalletTransaction({ ...transaction, dto, walletTransactionRepository })));
};
