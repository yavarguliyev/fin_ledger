import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import {
  AggregateType,
  AnalyticsEventTopic,
  BettingType,
  DomainEventType,
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
import { PlaceBetInput } from '../../dtos/betting/place-bet.dto';
import { AnalyticsEventPayloadDto } from '../../../analytics/dtos/analytics-event.dto';
import { WalletDto } from '../../dtos/wallet/wallet.dto';
import { WalletTransactionRepository } from '../../../wallet-transactions/repositories/wallet-transaction.repository';
import { emitKafkaWalletAnalytics } from '../../../analytics/helpers/wallet/emit-kafka-wallet-analytics.helper';
import { processWalletTransaction } from '../../helpers/transactions/process-wallet-transaction.helper';

@Injectable()
export abstract class WalletBaseUseCase<TInput, TOutput> {
  protected abstract readonly currentWalletTransactionType: WalletTransactionType;
  protected abstract readonly currentDomainEventType: DomainEventType;
  protected abstract readonly currentAggregateType: AggregateType;
  protected abstract readonly currentBettingType: BettingType;
  protected abstract readonly balanceWalletTransactionType: WalletTransactionType;
  protected abstract readonly requiredToCheckAmountMinor: boolean;

  protected readonly [KAFKA_SERVICE]: KafkaService;

  constructor (
    @Inject(KAFKA_SERVICE) kafkaService: KafkaService,
    protected readonly postgresService: PostgresService,
    protected readonly outboxRepository: OutboxRepository,
    protected readonly ledgerService: LedgerService,
    protected readonly walletRepository: WalletRepository,
    protected readonly walletTransactionRepository: WalletTransactionRepository
  ) {
    this[KAFKA_SERVICE] = kafkaService;
  }

  protected abstract execute(input: TInput): Promise<TOutput>;

  @KafkaPublish({ topic: AnalyticsEventTopic.WALLET_CREDITED, key: (result: unknown) => EXTRACT_ID_KEY(result, 'walletId') })
  protected async publishWalletCredited (eventPayload: AnalyticsEventPayloadDto): Promise<AnalyticsEventPayloadDto> {
    return Promise.resolve(eventPayload);
  }

  @KafkaPublish({ topic: AnalyticsEventTopic.WALLET_DEBITED, key: (result: unknown) => EXTRACT_ID_KEY(result, 'walletId') })
  protected async publishWalletDebited (eventPayload: AnalyticsEventPayloadDto): Promise<AnalyticsEventPayloadDto> {
    return Promise.resolve(eventPayload);
  }

  protected async processWallet (dto: PlaceBetInput): Promise<WalletDto> {
    const { adapter, walletId } = dto;
    if (!walletId) throw new BadRequestException('Wallet ID is required');

    const input = {
      ...dto,
      walletRepository: this.walletRepository,
      currentAggregateType: this.currentAggregateType,
      currentDomainEventType: this.currentDomainEventType,
      currentBettingType: this.currentBettingType,
      balanceWalletTransactionType: this.balanceWalletTransactionType,
      currentWalletTransactionType: this.currentWalletTransactionType,
      requiredToCheckAmountMinor: this.requiredToCheckAmountMinor,
      outboxRepository: this.outboxRepository,
      ledgerService: this.ledgerService,
      walletTransactionRepository: this.walletTransactionRepository
    };

    if (adapter) {
      const result = await processWalletTransaction({ adapter, ...input });
      return result.wallet;
    }

    const result = await this.postgresService.getWriteConnection().transaction(tx => processWalletTransaction({ ...input, adapter: tx }));

    void emitKafkaWalletAnalytics({
      ...result.eventPayload,
      eventType: this.currentDomainEventType,
      publishWalletCredited: payload => this.publishWalletCredited(payload),
      publishWalletDebited: payload => this.publishWalletDebited(payload)
    });

    return result.wallet;
  }
}
