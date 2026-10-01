import { Injectable } from '@nestjs/common';
import { DomainEventType, AggregateType, BettingType } from '@common/libs';

import { WalletDto } from '../../dtos/wallet/wallet.dto';
import { UserWalletsDto } from '../../dtos/input/user-wallets.dto';
import { WalletBaseUseCase } from '../base/wallet-base.use-case';

@Injectable()
export class GetUserWalletsUseCase extends WalletBaseUseCase<UserWalletsDto, WalletDto[]> {
  protected readonly currentDomainEventType: DomainEventType = DomainEventType.NONE;
  protected readonly currentAggregateType: AggregateType = 'None';
  protected readonly currentBettingType: BettingType = 'NONE';
  protected readonly requiredToCheckAmountMinor: boolean = false;

  constructor () {
    super();
  }

  async execute (dto: UserWalletsDto): Promise<WalletDto[]> {
    return this.walletRepository.findAllByUserId(dto);
  }
}
