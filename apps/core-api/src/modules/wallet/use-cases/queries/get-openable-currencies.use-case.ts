import { Injectable } from '@nestjs/common';
import { AggregateType, BettingType, DomainEventType } from '@common/libs';

import { CurrencyRepository } from '../../repositories/currency.repository';
import { UserWalletsDto } from '../../dtos/input/user-wallets.dto';
import { WalletBaseUseCase } from '../base/wallet-base.use-case';

@Injectable()
export class GetOpenableCurrenciesUseCase extends WalletBaseUseCase<UserWalletsDto, string[]> {
  protected readonly currentDomainEventType: DomainEventType = DomainEventType.NONE;
  protected readonly currentAggregateType: AggregateType = 'None';
  protected readonly currentBettingType: BettingType = 'NONE';
  protected readonly requiredToCheckAmountMinor: boolean = false;

  constructor (private readonly currencyRepository: CurrencyRepository) {
    super();
  }

  async execute (dto: UserWalletsDto): Promise<string[]> {
    const [activeCodes, wallets] = await Promise.all([this.currencyRepository.findActiveCodes(), this.walletRepository.findAllByUserId(dto)]);
    const held = new Set(wallets.map(wallet => wallet.currency));

    return activeCodes.filter(code => !held.has(code));
  }
}
