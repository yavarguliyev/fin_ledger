import { ConflictException, Injectable } from '@nestjs/common';
import { WalletStatus } from '@common/libs';

import { FundsBaseUseCase } from '../../base/funds-base.use-case';
import { CalculateNewBalancesDto } from '../../../dtos/balance/calculate-new-balances.dto';
import { CalculateBalancesInputDto } from '../../../dtos/step/calculate-balances-input.dto';

@Injectable()
export class ReserveFundsUseCase extends FundsBaseUseCase {
  protected override readonly allowedStatuses = [WalletStatus.ACTIVE];

  protected override calculateNewBalances ({ wallet, amountMinor }: CalculateBalancesInputDto): CalculateNewBalancesDto {
    const available = Number(wallet.availableBalanceMinor);
    if (available < amountMinor) throw new ConflictException('Insufficient available balance to reserve');

    const newAvailable = available - amountMinor;
    const newReserved = Number(wallet.reservedBalanceMinor) + amountMinor;

    return { newAvailable, newReserved };
  }
}
