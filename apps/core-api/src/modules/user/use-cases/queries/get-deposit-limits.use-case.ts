import { Injectable } from '@nestjs/common';

import { DepositLimitRepository } from '../../repositories/deposit-limit.repository';
import { UserIdRequestDto } from '../../dtos/request/user-id-request.dto';
import { DepositLimitViewDto } from '../../dtos/deposit-limits/deposit-limit-view.dto';
import { DepositLimitHelper } from '../../helpers/deposit-limit.helper';
import { UserBaseCase } from '../base/user-base.use-case';

@Injectable()
export class GetDepositLimitsUseCase extends UserBaseCase<UserIdRequestDto, DepositLimitViewDto[]> {
  constructor (private readonly depositLimitRepository: DepositLimitRepository) {
    super();
  }

  async execute ({ userId }: UserIdRequestDto): Promise<DepositLimitViewDto[]> {
    const limits = await this.depositLimitRepository.findForUser({ userId });

    return limits.map(limit => {
      const settled = DepositLimitHelper.settled({ limit });

      return {
        period: settled.period,
        currency: settled.currency,
        amountMinor: Number(settled.amountMinor),
        pendingAmountMinor: settled.pendingAmountMinor === null ? null : Number(settled.pendingAmountMinor),
        pendingEffectiveAt: settled.pendingEffectiveAt
      };
    });
  }
}
