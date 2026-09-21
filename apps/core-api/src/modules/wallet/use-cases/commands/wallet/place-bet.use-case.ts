import { Injectable } from '@nestjs/common';
import { DomainEventType, EntryType, BettingType, AggregateType, WalletStatus, WalletTransactionType } from '@common/libs';

import { WalletBaseUseCase } from '../../base/wallet-base.use-case';
import { WalletOperationDto } from '../../../dtos/input/wallet-operation.dto';
import { WalletOperationResultDto } from '../../../dtos/transaction/wallet-operation-result.dto';

@Injectable()
export class PlaceBetUseCase extends WalletBaseUseCase<WalletOperationDto, WalletOperationResultDto> {
  protected override readonly currentWalletTransactionType: WalletTransactionType = WalletTransactionType.BET_STAKE;
  protected readonly currentDomainEventType: DomainEventType = DomainEventType.WALLET_DEBITED;
  protected readonly currentAggregateType: AggregateType = 'Wallet';
  protected readonly currentBettingType: BettingType = 'BET';
  protected override readonly balanceWalletTransactionType = EntryType.DEBIT;
  protected readonly requiredToCheckAmountMinor: boolean = true;
  protected override readonly allowedStatuses = [WalletStatus.ACTIVE];

  override async execute (dto: WalletOperationDto): Promise<WalletOperationResultDto> {
    return super.processWallet(dto);
  }
}
