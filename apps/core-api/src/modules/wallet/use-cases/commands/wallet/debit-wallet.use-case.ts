import { Injectable } from '@nestjs/common';
import { DomainEventType, BettingType, AggregateType, WalletTransactionType } from '@common/libs';

import { WalletBaseUseCase } from '../../base/wallet-base.use-case';
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

  constructor () {
    super();
  }

  async execute (input: PlaceBetInput): Promise<WalletDto> {
    return this.processWallet(input);
  }
}
