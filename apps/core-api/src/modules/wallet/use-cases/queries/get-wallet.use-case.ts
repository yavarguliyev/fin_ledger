import { Inject, Injectable } from '@nestjs/common';
import {
  WalletTransactionType,
  DomainEventType,
  AggregateType,
  BettingType,
  KAFKA_SERVICE,
  KafkaService,
  PostgresService,
  OutboxRepository
} from '@common/libs';

import { WalletRepository } from '../../repositories/wallet.repository';
import { WalletDto } from '../../dtos/wallet/wallet.dto';
import { WalletBaseUseCase } from '../base/wallet-base.use-case';
import { LedgerService } from '../../../ledger/ledger.service';
import { WalletTransactionRepository } from '../../../wallet-transactions/repositories/wallet-transaction.repository';

@Injectable()
export class GetWalletUseCase extends WalletBaseUseCase<string, WalletDto | null> {
  protected readonly currentWalletTransactionType: WalletTransactionType = WalletTransactionType.NONE;
  protected readonly currentDomainEventType: DomainEventType = DomainEventType.NONE;
  protected readonly currentAggregateType: AggregateType = 'None';
  protected readonly currentBettingType: BettingType = 'NONE';
  protected readonly balanceWalletTransactionType = WalletTransactionType.NONE;
  protected readonly requiredToCheckAmountMinor: boolean = false;

  constructor (
    @Inject(KAFKA_SERVICE) kafkaService: KafkaService,
    protected override readonly postgresService: PostgresService,
    protected override readonly outboxRepository: OutboxRepository,
    protected override readonly ledgerService: LedgerService,
    protected override readonly walletRepository: WalletRepository,
    protected override readonly walletTransactionRepository: WalletTransactionRepository
  ) {
    super(kafkaService, postgresService, outboxRepository, ledgerService, walletRepository, walletTransactionRepository);
  }

  async execute (id: string): Promise<WalletDto | null> {
    return this.walletRepository.findById(id);
  }
}
