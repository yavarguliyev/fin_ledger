import { Inject, Injectable } from '@nestjs/common';
import {
  DomainEventType,
  PostgresService,
  OutboxRepository,
  BettingType,
  AggregateType,
  WalletTransactionType,
  KAFKA_SERVICE,
  KafkaService
} from '@common/libs';

import { WalletRepository } from '../../../repositories/wallet.repository';
import { LedgerService } from '../../../../ledger/ledger.service';
import { WalletBaseUseCase } from '../../base/wallet-base.use-case';
import { WalletTransactionRepository } from '../../../../wallet-transactions/repositories/wallet-transaction.repository';
import { PlaceBetInput } from '../../../dtos/betting/place-bet.dto';
import { WalletDto } from '../../../dtos/wallet/wallet.dto';

@Injectable()
export class DebitWalletUseCase extends WalletBaseUseCase<PlaceBetInput, WalletDto> {
  protected readonly currentWalletTransactionType: WalletTransactionType = WalletTransactionType.DEBIT;
  protected readonly currentDomainEventType: DomainEventType = DomainEventType.WALLET_DEBITED;
  protected readonly currentAggregateType: AggregateType = 'Wallet';
  protected readonly currentBettingType: BettingType = 'NONE';
  protected readonly balanceWalletTransactionType = WalletTransactionType.DEBIT;
  protected readonly requiredToCheckAmountMinor: boolean = true;

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

  async execute (input: PlaceBetInput): Promise<WalletDto> {
    return this.processWallet(input);
  }
}
