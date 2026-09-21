import { BadRequestException, Inject } from '@nestjs/common';
import {
  AggregateType,
  AnalyticsEventTopic,
  BettingType,
  DomainEventType,
  EntryType,
  WalletStatus,
  WalletTransactionType,
  EXTRACT_ID_KEY,
  KAFKA_SERVICE,
  KafkaPublish,
  KafkaService,
  OutboxRepository,
  PostgresService
} from '@common/libs';

import { WalletRepository } from '../../repositories/wallet.repository';
import { LedgerService } from '../../../ledger/ledger.service';
import { WalletOperationDto } from '../../dtos/input/wallet-operation.dto';
import { AnalyticsEventPayloadDto } from '../../../analytics/dtos/payload/analytics-event-payload.dto';
import { WalletOperationResultDto } from '../../dtos/transaction/wallet-operation-result.dto';
import { WalletTransactionRepository } from '../../../wallet-transactions/repositories/wallet-transaction.repository';
import { AnalyticsHelper } from '../../../analytics/helpers/analytics.helper';
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

  @Inject(KAFKA_SERVICE)
  protected readonly [KAFKA_SERVICE]!: KafkaService;

  abstract execute(input: TInput): Promise<TOutput>;

  @KafkaPublish({ topic: AnalyticsEventTopic.WALLET_CREDITED, key: ({ result }) => EXTRACT_ID_KEY({ result, field: 'walletId' }) })
  protected async publishWalletCredited (eventPayload: AnalyticsEventPayloadDto): Promise<AnalyticsEventPayloadDto> {
    return Promise.resolve(eventPayload);
  }

  @KafkaPublish({ topic: AnalyticsEventTopic.WALLET_DEBITED, key: ({ result }) => EXTRACT_ID_KEY({ result, field: 'walletId' }) })
  protected async publishWalletDebited (eventPayload: AnalyticsEventPayloadDto): Promise<AnalyticsEventPayloadDto> {
    return Promise.resolve(eventPayload);
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
      return { wallet: inTx.wallet, ledgerTransactionId: inTx.ledgerTransactionId };
    }

    const result = await this.postgresService
      .getWriteConnection()
      .transaction({ callback: tx => WalletHelper.processWalletTransaction({ ...input, adapter: tx }) });

    void AnalyticsHelper.emitKafkaWalletAnalytics({
      ...result.eventPayload,
      eventType: this.currentDomainEventType,
      publishWalletCredited: payload => this.publishWalletCredited(payload),
      publishWalletDebited: payload => this.publishWalletDebited(payload)
    });

    return { wallet: result.wallet, ledgerTransactionId: result.ledgerTransactionId };
  }
}
