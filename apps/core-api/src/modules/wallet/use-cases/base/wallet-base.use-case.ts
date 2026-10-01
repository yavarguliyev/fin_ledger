import { BadRequestException, Inject } from '@nestjs/common';
import {
  AggregateType,
  AnalyticsEventTopic,
  BettingType,
  DomainEventType,
  EntryType,
  WalletStatus,
  WalletTransactionType,
  OutboxDestination,
  OutboxRepository,
  PostgresService
} from '@common/libs';

import { PublishWalletAnalyticsDto } from '../../dtos/step/publish-wallet-analytics.dto';
import { RecordWalletAnalyticsDto } from '../../dtos/step/record-wallet-analytics.dto';
import { WalletRepository } from '../../repositories/wallet.repository';
import { LedgerService } from '../../../ledger/ledger.service';
import { WalletOperationDto } from '../../dtos/input/wallet-operation.dto';
import { AnalyticsEventPayloadDto } from '../../../analytics/dtos/payload/analytics-event-payload.dto';
import { WalletOperationResultDto } from '../../dtos/transaction/wallet-operation-result.dto';
import { WalletTransactionRepository } from '../../../wallet-transactions/repositories/wallet-transaction.repository';
import { WalletHelper } from '../../helpers/wallet.helper';

export abstract class WalletBaseUseCase<TInput, TOutput> {
  protected readonly currentWalletTransactionType?: WalletTransactionType;
  protected abstract readonly currentDomainEventType: DomainEventType;
  protected abstract readonly currentAggregateType: AggregateType;
  protected abstract readonly currentBettingType: BettingType;
  protected readonly balanceWalletTransactionType?: EntryType;
  protected abstract readonly requiredToCheckAmountMinor: boolean;
  protected readonly allowedStatuses?: WalletStatus[];

  @Inject(PostgresService)
  protected readonly postgresService!: PostgresService;

  @Inject(WalletRepository)
  protected readonly walletRepository!: WalletRepository;

  @Inject(OutboxRepository)
  protected readonly outboxRepository!: OutboxRepository;

  @Inject(LedgerService)
  protected readonly ledgerService!: LedgerService;

  @Inject(WalletTransactionRepository)
  protected readonly walletTransactionRepository!: WalletTransactionRepository;

  abstract execute(input: TInput): Promise<TOutput>;

  protected async publishWalletCredited (dto: PublishWalletAnalyticsDto): Promise<AnalyticsEventPayloadDto> {
    return this.recordWalletAnalytics({ ...dto, eventType: AnalyticsEventTopic.WALLET_CREDITED });
  }

  protected async publishWalletDebited (dto: PublishWalletAnalyticsDto): Promise<AnalyticsEventPayloadDto> {
    return this.recordWalletAnalytics({ ...dto, eventType: AnalyticsEventTopic.WALLET_DEBITED });
  }

  private async publishWalletAnalytics ({ eventPayload, adapter }: PublishWalletAnalyticsDto): Promise<void> {
    const credited = this.currentDomainEventType === DomainEventType.WALLET_CREDITED;
    const publish = credited ? this.publishWalletCredited.bind(this) : this.publishWalletDebited.bind(this);

    await publish({ eventPayload, ...(adapter && { adapter }) });
  }

  private async recordWalletAnalytics ({ eventType, eventPayload, adapter }: RecordWalletAnalyticsDto): Promise<AnalyticsEventPayloadDto> {
    await this.outboxRepository.createEvent({
      aggregateType: 'Wallet',
      aggregateId: eventPayload.walletId,
      eventType,
      payload: { ...eventPayload },
      destination: OutboxDestination.KAFKA,
      ...(adapter && { adapter })
    });

    return eventPayload;
  }

  protected async processWallet (dto: WalletOperationDto): Promise<WalletOperationResultDto> {
    const { adapter, walletId } = dto;
    if (!walletId) throw new BadRequestException('Wallet ID is required');

    const { balanceWalletTransactionType } = this;
    const currentWalletTransactionType = dto.transactionType ?? this.currentWalletTransactionType;
    if (!currentWalletTransactionType || !balanceWalletTransactionType) throw new BadRequestException('Wallet transaction type is required');

    const input = {
      ...dto,
      walletRepository: this.walletRepository,
      currentAggregateType: this.currentAggregateType,
      currentDomainEventType: this.currentDomainEventType,
      currentBettingType: this.currentBettingType,
      balanceWalletTransactionType,
      currentWalletTransactionType,
      requiredToCheckAmountMinor: this.requiredToCheckAmountMinor,
      ...(this.allowedStatuses && { allowedStatuses: this.allowedStatuses }),
      outboxRepository: this.outboxRepository,
      ledgerService: this.ledgerService,
      walletTransactionRepository: this.walletTransactionRepository
    };

    if (adapter) {
      const inTx = await WalletHelper.processWalletTransaction({ adapter, ...input });
      await this.publishWalletAnalytics({ eventPayload: inTx.eventPayload, adapter });
      return { wallet: inTx.wallet, ledgerTransactionId: inTx.ledgerTransactionId };
    }

    const result = await this.postgresService.getWriteConnection().transaction({
      callback: async tx => {
        const processed = await WalletHelper.processWalletTransaction({ ...input, adapter: tx });
        await this.publishWalletAnalytics({ eventPayload: processed.eventPayload, adapter: tx });
        return processed;
      }
    });

    return { wallet: result.wallet, ledgerTransactionId: result.ledgerTransactionId };
  }
}
