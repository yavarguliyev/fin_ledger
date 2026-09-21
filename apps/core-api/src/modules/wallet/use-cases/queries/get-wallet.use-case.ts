import { Injectable } from '@nestjs/common';

import { WalletDto } from '../../dtos/wallet/wallet.dto';
import { WalletIdRequestDto } from '../../dtos/request/wallet-id-request.dto';
import { WalletBaseUseCase } from '../base/wallet-base.use-case';
import { DomainEventType, AggregateType, BettingType } from '@common/libs';

@Injectable()
export class GetWalletUseCase extends WalletBaseUseCase<WalletIdRequestDto, WalletDto | null> {
  protected readonly currentDomainEventType: DomainEventType = DomainEventType.NONE;
  protected readonly currentAggregateType: AggregateType = 'None';
  protected readonly currentBettingType: BettingType = 'NONE';
  protected readonly requiredToCheckAmountMinor: boolean = false;

  async execute ({ walletId }: WalletIdRequestDto): Promise<WalletDto | null> {
    return this.walletRepository.findById({ id: walletId });
  }
}
