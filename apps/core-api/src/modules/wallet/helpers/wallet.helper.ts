import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { WalletTransactionType } from '@common/libs';

import {
  AnalyticsEventPayload,
  BuildAnalyticsEventPayloadInput,
  BuildWalletTransactionInput,
  CreateWalletEventDto,
  PerformBalanceUpdateDto,
  ProcessWalletTransactionDto,
  ValidateWalletTransactionInput,
  WalletDto,
  WalletTransactionOutput,
  WalletTransactionResultDto
} from '../dtos/wallet-helper.dto';
import { WalletConversionTransactionHelper } from '../../wallet-currency-conversion/helpers/wallet-conversion-transaction.helper';

export class WalletHelper {
  public static buildWalletTransactionInput (options: BuildWalletTransactionInput): WalletTransactionOutput {
    const { wallet, amountMinor, transactionId, adapter, reference } = options;
    return { wallet, amountMinor, transactionId, ...(adapter && { adapter }), ...(reference && { reference }) };
  }

  public static buildAnalyticsEventPayload (options: BuildAnalyticsEventPayloadInput): AnalyticsEventPayload {
    const { walletId, amountMinor, currency, transactionId, reference, currentBettingType } = options;
    const bettingType = currentBettingType !== 'NONE' ? { type: currentBettingType } : {};
    return { walletId, amountMinor, currency, transactionId, reference, timestamp: new Date().toISOString(), ...bettingType };
  }

  public static validateWalletTransaction (options: ValidateWalletTransactionInput): WalletDto {
    const { wallet, currency, amountMinor, requiredToCheckAmountMinor } = options;

    if (!wallet) throw new NotFoundException('Wallet not found');
    if (wallet.currency !== currency) throw new ConflictException('Currency mismatch');
    if (requiredToCheckAmountMinor && Number(wallet.availableBalanceMinor) < amountMinor) throw new BadRequestException('Insufficient funds');

    return wallet;
  }

  public static async performWalletBalanceUpdate (options: PerformBalanceUpdateDto): Promise<WalletDto> {
    const { wallet, amountMinor, tx, balanceWalletTransactionType, walletRepository } = options;
    const delta = balanceWalletTransactionType === WalletTransactionType.DEBIT ? -amountMinor : amountMinor;

    const newAvailable = Number(wallet.availableBalanceMinor) + delta;
    const newReserved = Number(wallet.reservedBalanceMinor);

    const updatedWallet = await walletRepository.updateBalances({
      walletId: wallet.id,
      availableBalanceMinor: newAvailable,
      reservedBalanceMinor: newReserved,
      expectedVersion: wallet.version!,
      adapter: tx!
    });

    if (!updatedWallet) throw new ConflictException('Concurrent modification of wallet balance');
    return updatedWallet;
  }

  public static async createEvent (dto: CreateWalletEventDto): Promise<void> {
    const { eventPayload, aggregateType, eventType, outboxRepository, tx } = dto;
    await outboxRepository.createEvent({ aggregateType, aggregateId: eventPayload.walletId, eventType, payload: eventPayload }, tx);
  }

  public static async processWalletTransaction (options: ProcessWalletTransactionDto): Promise<WalletTransactionResultDto> {
    const {
      amountMinor,
      currency,
      transactionId,
      reference,
      adapter,
      walletRepository,
      requiredToCheckAmountMinor,
      balanceWalletTransactionType,
      currentBettingType,
      currentAggregateType: aggregateType,
      currentDomainEventType: eventType,
      currentWalletTransactionType: transactionType,
      outboxRepository,
      ledgerService,
      walletTransactionRepository,
      walletId
    } = options;

    const walletToValidate = await walletRepository.findByIdForUpdate(options.walletId, adapter);
    const wallet = WalletHelper.validateWalletTransaction({ wallet: walletToValidate, currency, amountMinor, requiredToCheckAmountMinor });

    const updatedWallet = await WalletHelper.performWalletBalanceUpdate({
      wallet,
      amountMinor,
      tx: adapter!,
      balanceWalletTransactionType,
      walletRepository
    });

    const input = WalletHelper.buildWalletTransactionInput({ wallet, amountMinor, transactionId, adapter, reference });
    await WalletConversionTransactionHelper.recordWalletTransactions({ input, ledgerService, walletTransactionRepository, transactionType, direction: balanceWalletTransactionType });

    const eventPayload = WalletHelper.buildAnalyticsEventPayload({ walletId, amountMinor, currency, transactionId, reference, currentBettingType });
    await WalletHelper.createEvent({ eventPayload: { ...eventPayload, userId: wallet.userId }, eventType, aggregateType, outboxRepository, tx: adapter! });

    return { wallet: updatedWallet, eventPayload };
  }
}
