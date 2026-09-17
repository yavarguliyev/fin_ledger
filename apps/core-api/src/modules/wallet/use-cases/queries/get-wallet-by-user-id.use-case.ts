import { Injectable } from '@nestjs/common';

import { WalletDto } from '../../dtos/wallet/wallet.dto';
import { WalletTransactionType, DomainEventType, AggregateType, BettingType } from '@common/libs';
import { WalletBaseUseCase } from '../base/wallet-base.use-case';

@Injectable()
export class GetWalletByUserIdUseCase extends WalletBaseUseCase<string, WalletDto | null> {
  protected readonly currentWalletTransactionType: WalletTransactionType = WalletTransactionType.NONE;
  protected readonly currentDomainEventType: DomainEventType = DomainEventType.NONE;
  protected readonly currentAggregateType: AggregateType = 'None';
  protected readonly currentBettingType: BettingType = 'NONE';
  protected readonly balanceWalletTransactionType = WalletTransactionType.NONE;
  protected readonly requiredToCheckAmountMinor: boolean = false;

  constructor () {
    super();
  }

  async execute (userId: string): Promise<WalletDto | null> {
    return this.walletRepository.findByUserId(userId);
  }
}
