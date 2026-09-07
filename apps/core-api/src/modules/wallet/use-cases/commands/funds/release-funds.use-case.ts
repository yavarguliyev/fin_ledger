import { ConflictException, Injectable } from '@nestjs/common';
import { PostgresService } from '@common/libs';

import { WalletRepository } from '../../../repositories/wallet.repository';
import { FundsBaseUseCase } from '../../base/funds-base.use-case';
import { WalletDto, WalletInput } from '../../../dtos/wallet/wallet.dto';
import { CalculateNewBalancesDto } from '../../../dtos/balance/calculate-new-balances.dto';

@Injectable()
export class ReleaseFundsUseCase extends FundsBaseUseCase<WalletInput, WalletDto> {
  constructor (
    protected override readonly postgresService: PostgresService,
    protected override readonly walletRepository: WalletRepository
  ) {
    super(postgresService, walletRepository);
  }

  async execute (input: WalletInput): Promise<WalletDto> {
    return this.processFunds(input);
  }

  protected override calculateNewBalances (wallet: WalletDto, amountMinor: number): CalculateNewBalancesDto {
    const reserved = Number(wallet.reservedBalanceMinor);
    if (reserved < amountMinor) throw new ConflictException('Insufficient reserved balance to release');

    const newAvailable = Number(wallet.availableBalanceMinor) + amountMinor;
    const newReserved = reserved - amountMinor;

    return { newAvailable, newReserved };
  }
}
