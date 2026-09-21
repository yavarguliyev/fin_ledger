import { Injectable } from '@nestjs/common';

import { WalletRepository } from '../../repositories/wallet.repository';
import { CurrencyRepository } from '../../repositories/currency.repository';
import { UserWalletsDto } from '../../dtos/input/user-wallets.dto';

@Injectable()
export class GetOpenableCurrenciesUseCase {
  constructor (
    private readonly walletRepository: WalletRepository,
    private readonly currencyRepository: CurrencyRepository
  ) {}

  async execute (dto: UserWalletsDto): Promise<string[]> {
    const [activeCodes, wallets] = await Promise.all([this.currencyRepository.findActiveCodes(), this.walletRepository.findAllByUserId(dto)]);
    const held = new Set(wallets.map(wallet => wallet.currency));

    return activeCodes.filter(code => !held.has(code));
  }
}
