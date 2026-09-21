import { InternalServerErrorException } from '@nestjs/common';
import { EntryType, WalletTransactionStatus } from '@common/libs';

import { RecordWalletTransactionDto } from '../dtos/helper/record-wallet-transaction.dto';
import { LedgerHelper } from '../../ledger/helpers/ledger.helper';

export class WalletLedgerHelper {
  static async recordTransaction (options: RecordWalletTransactionDto): Promise<string> {
    const { input, ledgerService, walletTransactionRepository, transactionType, direction } = options;
    const { wallet, amountMinor, reference, adapter, transactionId } = input;

    const systemAccountId = await ledgerService.getSystemAccount({ currency: wallet.currency });
    const referenceValue = reference ?? transactionId;
    const isDebit = direction === EntryType.DEBIT;
    const idempotencyKey = `wallet-tx:${transactionId}:${direction}`;

    const entries = LedgerHelper.createLedgerEntries({ wallet, systemAccountId, amountMinor, referenceValue, isDebit });
    const ledgerEntries = await ledgerService.createTransaction({
      entries,
      transaction: { referenceType: 'wallet_transaction', description: `Wallet ${isDebit ? 'debit' : 'credit'}: ${referenceValue}`, idempotencyKey },
      adapter
    });

    const ledgerTransactionId = ledgerEntries[0]?.transactionId;
    if (!ledgerTransactionId) throw new InternalServerErrorException('Failed to create ledger entries');

    await walletTransactionRepository.createTransaction({
      walletId: wallet.id,
      type: transactionType,
      amountMinor: isDebit ? -amountMinor : amountMinor,
      balanceAfterMinor: Number(wallet.availableBalanceMinor) + Number(wallet.reservedBalanceMinor),
      idempotencyKey,
      currency: wallet.currency,
      ...(reference && { reference }),
      ledgerTransactionId,
      status: WalletTransactionStatus.COMPLETED,
      adapter: adapter!
    });

    return ledgerTransactionId;
  }
}
