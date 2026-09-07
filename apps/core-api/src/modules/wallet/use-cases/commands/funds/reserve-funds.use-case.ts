import { ConflictException, Injectable } from '@nestjs/common';
import { PostgresService } from '@common/libs';

import { WalletRepository } from '../../../repositories/wallet.repository';
import { FundsBaseUseCase } from '../../base/funds-base.use-case';
import { WalletDto, WalletInput } from '../../../dtos/wallet/wallet.dto';
import { CalculateNewBalancesDto } from '../../../dtos/balance/calculate-new-balances.dto';

@Injectable()
export class ReserveFundsUseCase extends FundsBaseUseCase<WalletInput, WalletDto> {
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
    const available = Number(wallet.availableBalanceMinor);
    if (available < amountMinor) throw new ConflictException('Insufficient available balance to reserve');

    const newAvailable = available - amountMinor;
    const newReserved = Number(wallet.reservedBalanceMinor) + amountMinor;

    return { newAvailable, newReserved };
  }
}
