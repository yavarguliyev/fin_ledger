import { ConvertWalletTransactionsParamsDto } from '../../dtos/transaction/convert-wallet-transactions-params.dto';
import { convertMinorAmount } from '../conversion/money-conversion.helper';

export const convertWalletTransactions = async (options: ConvertWalletTransactionsParamsDto): Promise<void> => {
  const { walletId, rate, targetCurrency, tx, walletTransactionRepository } = options;

  const transactions = await walletTransactionRepository.findByWalletId(walletId, tx);

  for (const transaction of transactions) {
    await walletTransactionRepository.update(
      transaction.id,
      {
        amountMinor: convertMinorAmount(transaction.amountMinor, rate),
        currency: targetCurrency
      },
      undefined,
      tx
    );
  }
};
