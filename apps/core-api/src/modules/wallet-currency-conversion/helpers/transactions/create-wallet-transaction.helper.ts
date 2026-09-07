import { InternalServerErrorException } from '@nestjs/common';
import { WalletTransactionStatus } from '@common/libs';

import { WalletTransactionParamsDto } from '../../../wallet/dtos/transaction/wallet-transaction-params.dto';

export const createWalletTransaction = async (options: WalletTransactionParamsDto): Promise<void> => {
  const { wallet, type, amountMinor, transactionId, ledgerEntryId, currency, dto, walletTransactionRepository } = options;

  const reference = `CONVERSION: ${dto.conversion.id}`;

  const created = await walletTransactionRepository.createTransaction({
    walletId: wallet.id,
    type,
    amountMinor,
    currency,
    transactionId,
    ledgerEntryId,
    conversionId: dto.conversion.id,
    reference,
    status: WalletTransactionStatus.COMPLETED,
    adapter: dto.tx
  });

  if (!created) {
    throw new InternalServerErrorException('Failed to create wallet transaction');
  }
};
