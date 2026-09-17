import { Injectable } from '@nestjs/common';
import { DomainEventType, BettingType, AggregateType, WalletTransactionType } from '@common/libs';

import { WalletBaseUseCase } from '../../base/wallet-base.use-case';
import { PlaceBetInput } from '../../../dtos/betting/place-bet.dto';
import { WalletDto } from '../../../dtos/wallet/wallet.dto';

@Injectable()
export class SettleWinningsUseCase extends WalletBaseUseCase<PlaceBetInput, WalletDto> {
  protected readonly currentWalletTransactionType: WalletTransactionType = WalletTransactionType.WINNING;
  protected readonly currentDomainEventType: DomainEventType = DomainEventType.WALLET_CREDITED;
  protected readonly currentAggregateType: AggregateType = 'Wallet';
  protected readonly currentBettingType: BettingType = 'WINNING';
  protected readonly balanceWalletTransactionType = WalletTransactionType.CREDIT;
  protected readonly requiredToCheckAmountMinor: boolean = false;

  constructor () {
    super();
  }

  async execute (input: PlaceBetInput): Promise<WalletDto> {
    return this.processWallet(input);
  }
}
