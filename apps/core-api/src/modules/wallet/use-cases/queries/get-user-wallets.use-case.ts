import { Injectable } from '@nestjs/common';

import { WalletRepository } from '../../repositories/wallet.repository';
import { WalletDto } from '../../dtos/wallet/wallet.dto';
import { UserWalletsDto } from '../../dtos/input/user-wallets.dto';

@Injectable()
export class GetUserWalletsUseCase {
  constructor (private readonly walletRepository: WalletRepository) {}

  async execute (dto: UserWalletsDto): Promise<WalletDto[]> {
    return this.walletRepository.findAllByUserId(dto);
  }
}
