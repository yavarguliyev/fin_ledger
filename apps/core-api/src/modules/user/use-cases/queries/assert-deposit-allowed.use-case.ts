import { ForbiddenException, Injectable } from '@nestjs/common';

import { DepositLimitRepository } from '../../repositories/deposit-limit.repository';
import { DepositAllowanceDto } from '../../dtos/deposit-limits/deposit-allowance.dto';
import { DepositLimitHelper } from '../../helpers/deposit-limit.helper';
import { DEPOSIT_LIMIT } from '../../constants/deposit-limits/deposit-limit.constant';
import { UserBaseCase } from '../base/user-base.use-case';

@Injectable()
export class AssertDepositAllowedUseCase extends UserBaseCase<DepositAllowanceDto, void> {
  constructor (private readonly depositLimitRepository: DepositLimitRepository) {
    super();
  }

  async execute ({ userId, currency, amountMinor }: DepositAllowanceDto): Promise<void> {
    const limits = await this.depositLimitRepository.findForUser({ userId });

    for (const limit of limits.filter(entry => entry.currency === currency)) {
      const allowed = DepositLimitHelper.effectiveAmount({ limit });
      const spent = await this.depositLimitRepository.spentInPeriod({ userId, currency, period: limit.period });

      if (spent + amountMinor > allowed) throw new ForbiddenException(DEPOSIT_LIMIT.EXCEEDED_MESSAGE);
    }
  }
}
