import { Injectable } from '@nestjs/common';

import { DepositLimitRepository } from '../../repositories/deposit-limit.repository';
import { SetDepositLimitDto } from '../../dtos/deposit-limits/set-deposit-limit.dto';
import { DepositLimitResponseDto } from '../../dtos/deposit-limits/deposit-limit-response.dto';
import { DepositLimitDto } from '../../dtos/deposit-limits/deposit-limit.dto';
import { DepositLimitHelper } from '../../helpers/deposit-limit.helper';
import { DEPOSIT_LIMIT } from '../../constants/deposit-limits/deposit-limit.constant';
import { LimitResponseInputDto } from '../../dtos/deposit-limits/limit-response-input.dto';
import { UserBaseCase } from '../base/user-base.use-case';

@Injectable()
export class SetDepositLimitUseCase extends UserBaseCase<SetDepositLimitDto, DepositLimitResponseDto> {
  constructor (private readonly depositLimitRepository: DepositLimitRepository) {
    super();
  }

  async execute ({ userId, period, currency, amountMinor }: SetDepositLimitDto): Promise<DepositLimitResponseDto> {
    const existing = await this.depositLimitRepository.findOne({ where: { userId, period, currency } });

    if (!existing) {
      const created = await this.depositLimitRepository.create({
        data: { userId, period, currency, amountMinor, pendingAmountMinor: null, pendingEffectiveAt: null }
      });

      return SetDepositLimitUseCase.respond({ limit: created as DepositLimitDto, message: DEPOSIT_LIMIT.LOWERED_MESSAGE });
    }

    const settled = DepositLimitHelper.settled({ limit: existing });
    const isRaise = amountMinor > Number(settled.amountMinor);

    const data = isRaise
      ? { amountMinor: Number(settled.amountMinor), pendingAmountMinor: amountMinor, pendingEffectiveAt: DepositLimitHelper.coolingOffEnd() }
      : { amountMinor, pendingAmountMinor: null, pendingEffectiveAt: null };

    const updated = await this.depositLimitRepository.update({ id: existing.id, data });
    const message = isRaise ? DEPOSIT_LIMIT.RAISE_PENDING_MESSAGE : DEPOSIT_LIMIT.LOWERED_MESSAGE;

    return SetDepositLimitUseCase.respond({ limit: updated as DepositLimitDto, message });
  }

  private static respond ({ limit, message }: LimitResponseInputDto): DepositLimitResponseDto {
    const { period, currency, amountMinor, pendingAmountMinor, pendingEffectiveAt } = limit;
    return { message, limit: { period, currency, amountMinor: Number(amountMinor), pendingAmountMinor, pendingEffectiveAt } };
  }
}
