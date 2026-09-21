import { Injectable } from '@nestjs/common';
import { DomainEventType, BettingType, AggregateType, EntryType, WalletTransactionType } from '@common/libs';

import { WalletBaseUseCase } from '../../base/wallet-base.use-case';
import { WalletOperationDto } from '../../../dtos/input/wallet-operation.dto';
import { WalletOperationResultDto } from '../../../dtos/transaction/wallet-operation-result.dto';

@Injectable()
export class CreditWalletUseCase extends WalletBaseUseCase<WalletOperationDto, WalletOperationResultDto> {
  protected override readonly currentWalletTransactionType: WalletTransactionType = WalletTransactionType.DEPOSIT;
  protected readonly currentDomainEventType: DomainEventType = DomainEventType.WALLET_CREDITED;
  protected readonly currentAggregateType: AggregateType = 'Wallet';
  protected readonly currentBettingType: BettingType = 'NONE';
  protected override readonly balanceWalletTransactionType: EntryType = EntryType.CREDIT;
  protected readonly requiredToCheckAmountMinor: boolean = false;

  async execute (input: WalletOperationDto): Promise<WalletOperationResultDto> {
    return this.processWallet(input);
  }
}
