import { DEPOSIT_LIMIT } from '../constants/deposit-limits/deposit-limit.constant';
import { DepositLimitDto } from '../dtos/deposit-limits/deposit-limit.dto';
import { DepositLimitRefDto } from '../dtos/deposit-limits/deposit-limit-ref.dto';

export class DepositLimitHelper {
  static coolingOffEnd (): string {
    return new Date(Date.now() + DEPOSIT_LIMIT.COOLING_OFF_HOURS * DEPOSIT_LIMIT.MS_PER_HOUR).toISOString();
  }

  static effectiveAmount ({ limit }: DepositLimitRefDto): number {
    if (DepositLimitHelper.pendingIsDue({ limit })) return Number(limit.pendingAmountMinor);
    return Number(limit.amountMinor);
  }

  static pendingIsDue ({ limit }: DepositLimitRefDto): boolean {
    if (limit.pendingAmountMinor === null || !limit.pendingEffectiveAt) return false;
    return new Date(limit.pendingEffectiveAt).getTime() <= Date.now();
  }

  static settled ({ limit }: DepositLimitRefDto): DepositLimitDto {
    if (!DepositLimitHelper.pendingIsDue({ limit })) return limit;
    return { ...limit, amountMinor: Number(limit.pendingAmountMinor), pendingAmountMinor: null, pendingEffectiveAt: null };
  }
}
