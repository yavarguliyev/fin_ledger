import { BadRequestException, ConflictException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { EntryType } from '@common/libs';

import { WalletDto } from '../dtos/wallet/wallet.dto';
import { CreateWalletEventDto } from '../dtos/events/create-wallet-event.dto';
import { WalletTransactionResultDto } from '../dtos/transaction/wallet-transaction-result.dto';
import { BuildAnalyticsEventPayloadDto } from '../dtos/helper/build-analytics-event-payload.dto';
import { PerformBalanceUpdateDto } from '../dtos/helper/perform-balance-update.dto';
import { ProcessWalletTransactionDto } from '../dtos/helper/process-wallet-transaction.dto';
import { ValidateWalletTransactionDto } from '../dtos/helper/validate-wallet-transaction.dto';
import { WalletTransactionInputDto } from '../dtos/helper/wallet-transaction-input.dto';
import { AssertWalletStatusDto } from '../dtos/helper/assert-wallet-status.dto';
import { AnalyticsEventPayloadDto } from '../../analytics/dtos/payload/analytics-event-payload.dto';
import { WalletLedgerHelper } from './wallet-ledger.helper';

export class WalletHelper {
  static buildWalletTransactionInput (options: WalletTransactionInputDto): WalletTransactionInputDto {
    const { wallet, amountMinor, transactionId, adapter, reference } = options;
    return { wallet, amountMinor, transactionId, ...(adapter && { adapter }), ...(reference && { reference }) };
  }

  static buildAnalyticsEventPayload (options: BuildAnalyticsEventPayloadDto): AnalyticsEventPayloadDto {
    const { walletId, amountMinor, currency, transactionId, reference, currentBettingType } = options;
    const bettingType = currentBettingType !== 'NONE' ? { type: currentBettingType } : {};
    return { walletId, amountMinor, currency, transactionId, reference, timestamp: new Date().toISOString(), ...bettingType };
  }

  static validateWalletTransaction (options: ValidateWalletTransactionDto): WalletDto {
    const { wallet, currency, amountMinor, requiredToCheckAmountMinor, allowedStatuses } = options;

    if (!wallet) throw new NotFoundException('Wallet not found');
    if (allowedStatuses) WalletHelper.assertWalletStatus({ status: wallet.status, allowedStatuses });
    if (wallet.currency !== currency) throw new ConflictException('Currency mismatch');
    if (requiredToCheckAmountMinor && Number(wallet.availableBalanceMinor) < amountMinor) throw new BadRequestException('Insufficient funds');

    return wallet;
  }

  static assertWalletStatus ({ status, allowedStatuses }: AssertWalletStatusDto): void {
    if (status && allowedStatuses.includes(status)) return;
    throw new ForbiddenException(`This wallet is ${status?.toLowerCase() ?? 'unavailable'} and cannot be used for this operation`);
  }

  static async performWalletBalanceUpdate (options: PerformBalanceUpdateDto): Promise<WalletDto> {
    const { wallet, amountMinor, adapter, balanceWalletTransactionType, walletRepository } = options;
    const delta = balanceWalletTransactionType === EntryType.DEBIT ? -amountMinor : amountMinor;

    const newAvailable = Number(wallet.availableBalanceMinor) + delta;
    const newReserved = Number(wallet.reservedBalanceMinor);

    const updatedWallet = await walletRepository.updateBalances({
      walletId: wallet.id,
      availableBalanceMinor: newAvailable,
      reservedBalanceMinor: newReserved,
      expectedVersion: wallet.version!,
      adapter
    });

    if (!updatedWallet) throw new ConflictException('Concurrent modification of wallet balance');
    return updatedWallet;
  }

  static async createEvent (dto: CreateWalletEventDto): Promise<void> {
    const { eventPayload, aggregateType, eventType, outboxRepository, adapter } = dto;
    await outboxRepository.createEvent({ aggregateType, aggregateId: eventPayload.walletId, eventType, payload: eventPayload, adapter });
  }

  static async processWalletTransaction (options: ProcessWalletTransactionDto): Promise<WalletTransactionResultDto> {
    const {
      amountMinor,
      currency,
      transactionId,
      reference,
      adapter,
      walletRepository,
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

    const walletToValidate = await walletRepository.findByIdForUpdate({ id: options.walletId, adapter });
    const wallet = WalletHelper.validateWalletTransaction({ ...options, wallet: walletToValidate });

    const updatedWallet = await WalletHelper.performWalletBalanceUpdate({
      wallet,
      amountMinor,
      adapter: adapter!,
      balanceWalletTransactionType,
      walletRepository
    });

    const input = WalletHelper.buildWalletTransactionInput({ wallet: updatedWallet, amountMinor, transactionId, adapter, reference });

    const ledgerTransactionId = await WalletLedgerHelper.recordTransaction({
      input,
      ledgerService,
      walletTransactionRepository,
      transactionType,
      direction: balanceWalletTransactionType
    });

    const eventPayload = WalletHelper.buildAnalyticsEventPayload({ walletId, amountMinor, currency, transactionId, reference, currentBettingType });
    await WalletHelper.createEvent({ eventPayload: { ...eventPayload, userId: wallet.userId }, eventType, aggregateType, outboxRepository, adapter: adapter! });

    return { wallet: updatedWallet, ledgerTransactionId, eventPayload };
  }
}
