import { Inject, Injectable, InternalServerErrorException } from '@nestjs/common';
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

import { WalletRepository } from '../../../repositories/wallet.repository';
import { WalletDto } from '../../../dtos/wallet/wallet.dto';
import { CreateWalletDto } from '../../../dtos/wallet/wallet-create.dto';
import { LedgerService } from '../../../../ledger/ledger.service';
import { WalletTransactionRepository } from '../../../../wallet-transactions/repositories/wallet-transaction.repository';
import { WalletBaseUseCase } from '../../base/wallet-base.use-case';

@Injectable()
export class CreateWalletUseCase extends WalletBaseUseCase<CreateWalletDto, WalletDto> {
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

  override async execute (input: CreateWalletDto): Promise<WalletDto> {
    const wallet = await this.walletRepository.createWallet(input);
    if (!wallet) throw new InternalServerErrorException('Failed to create wallet');
    return wallet;
  }
}
