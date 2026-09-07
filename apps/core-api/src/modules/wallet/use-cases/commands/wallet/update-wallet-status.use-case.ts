import { Inject, Injectable, NotFoundException } from '@nestjs/common';

import { WalletDto, UpdateWalletStatusInput } from '../../../dtos/wallet/wallet.dto';
import { WalletBaseUseCase } from '../../base/wallet-base.use-case';
import {
  WalletTransactionType,
  DomainEventType,
  AggregateType,
  BettingType,
  KAFKA_SERVICE,
  KafkaService,
  OutboxRepository,
  PostgresService
} from '@common/libs';
import { LedgerService } from '../../../../ledger/ledger.service';
import { WalletTransactionRepository } from '../../../../wallet-transactions/repositories/wallet-transaction.repository';
import { WalletRepository } from '../../../repositories/wallet.repository';

@Injectable()
export class UpdateWalletStatusUseCase extends WalletBaseUseCase<UpdateWalletStatusInput, WalletDto> {
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

  async execute ({ walletId, status }: UpdateWalletStatusInput): Promise<WalletDto> {
    const wallet = await this.walletRepository.findById(walletId);
    if (!wallet) throw new NotFoundException(`Wallet with ID ${walletId} not found`);

    const updatedWallet = await this.walletRepository.update(walletId, { status: status });
    if (!updatedWallet) throw new NotFoundException('Failed to update wallet status');

    return updatedWallet;
  }
}
