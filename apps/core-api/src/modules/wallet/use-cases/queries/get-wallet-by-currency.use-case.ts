import { Injectable } from '@nestjs/common';
import { DomainEventType, AggregateType, BettingType } from '@common/libs';

import { WalletDto } from '../../dtos/wallet/wallet.dto';
import { WalletByCurrencyDto } from '../../dtos/input/wallet-by-currency.dto';
import { WalletBaseUseCase } from '../base/wallet-base.use-case';

@Injectable()
export class GetWalletByCurrencyUseCase extends WalletBaseUseCase<WalletByCurrencyDto, WalletDto | null> {
  protected readonly currentDomainEventType: DomainEventType = DomainEventType.NONE;
  protected readonly currentAggregateType: AggregateType = 'None';
  protected readonly currentBettingType: BettingType = 'NONE';
  protected readonly requiredToCheckAmountMinor: boolean = false;

  constructor () {
    super();
  }

  async execute (dto: WalletByCurrencyDto): Promise<WalletDto | null> {
    return this.walletRepository.findByUserAndCurrency(dto);
  }
}
