import { InternalServerErrorException } from '@nestjs/common';
import { WalletTransactionStatus, WalletTransactionType } from '@common/libs';

import {
  ConvertWalletTransactionsParamsDto,
  CreateWalletTransactionParamsDto,
  WalletCurrencyConversionParamsDto,
  WalletTransactionParamsDto
} from '../dtos/wallet-conversion-helper.dto';
import { WalletConversionLedgerHelper } from './wallet-conversion-ledger.helper';
import { LedgerHelper } from '../../ledger/helpers/ledger.helper';
import { WalletConversionHelper } from './wallet-conversion.helper';

export class WalletConversionTransactionHelper {
  public static async createWalletTransaction (options: WalletTransactionParamsDto): Promise<void> {
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
  }

  public static async recordWalletCurrencyConversion (options: WalletCurrencyConversionParamsDto): Promise<void> {
    const { dto, ledgerService, walletTransactionRepository } = options;

    const [sourceSystemAccountId, targetSystemAccountId] = await Promise.all([
      ledgerService.getOrCreateSystemAccount(dto.sourceWallet.currency, dto.tx),
      ledgerService.getOrCreateSystemAccount(dto.targetWallet.currency, dto.tx)
    ]);

    const [sourceEntryId, targetEntryId] = await Promise.all([
      WalletConversionLedgerHelper.createConversionEntry({ dto, systemAccountId: sourceSystemAccountId, ledgerService, direction: 'source' }),
      WalletConversionLedgerHelper.createConversionEntry({ dto, systemAccountId: targetSystemAccountId, ledgerService, direction: 'target' })
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

    await Promise.all(transactions.map(transaction => WalletConversionTransactionHelper.createWalletTransaction({ ...transaction, dto, walletTransactionRepository })));
  }

  public static async convertWalletTransactions (options: ConvertWalletTransactionsParamsDto): Promise<void> {
    const { walletId, rate, targetCurrency, tx, walletTransactionRepository } = options;
    const transactions = await walletTransactionRepository.findByWalletId(walletId, tx);

    for (const transaction of transactions) {
      await walletTransactionRepository.update(
        transaction.id,
        {
          amountMinor: WalletConversionHelper.convertMinorAmount(transaction.amountMinor, rate),
          currency: targetCurrency
        },
        undefined,
        tx
      );
    }
  }

  public static async recordWalletTransactions (options: CreateWalletTransactionParamsDto): Promise<void> {
    const { input, ledgerService, walletTransactionRepository, transactionType, direction } = options;
    const { wallet, amountMinor, reference, adapter, transactionId } = input;

    const systemAccountId = await ledgerService.getOrCreateSystemAccount(wallet.currency, adapter);
    const referenceValue = reference ?? transactionId;
    const isDebit = direction === WalletTransactionType.DEBIT;

    const entries = LedgerHelper.createLedgerEntries({ wallet, systemAccountId, amountMinor, referenceValue, isDebit });
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
  }
}
