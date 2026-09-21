import { Injectable } from '@nestjs/common';

import { WalletRepository } from '../../repositories/wallet.repository';
import { WalletDto } from '../../dtos/wallet/wallet.dto';
import { WalletByCurrencyDto } from '../../dtos/input/wallet-by-currency.dto';

@Injectable()
export class GetWalletByCurrencyUseCase {
  constructor (private readonly walletRepository: WalletRepository) {}

  async execute (dto: WalletByCurrencyDto): Promise<WalletDto | null> {
    return this.walletRepository.findByUserAndCurrency(dto);
  }
}
