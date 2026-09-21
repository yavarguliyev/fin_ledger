import { ConflictException, Injectable } from '@nestjs/common';

import { FundsBaseUseCase } from '../../base/funds-base.use-case';
import { CalculateNewBalancesDto } from '../../../dtos/balance/calculate-new-balances.dto';
import { CalculateBalancesInputDto } from '../../../dtos/step/calculate-balances-input.dto';

@Injectable()
export class ReleaseFundsUseCase extends FundsBaseUseCase {
  protected override calculateNewBalances ({ wallet, amountMinor }: CalculateBalancesInputDto): CalculateNewBalancesDto {
    const reserved = Number(wallet.reservedBalanceMinor);
    if (reserved < amountMinor) throw new ConflictException('Insufficient reserved balance to release');

    const newAvailable = Number(wallet.availableBalanceMinor) + amountMinor;
    const newReserved = reserved - amountMinor;

    return { newAvailable, newReserved };
  }
}
