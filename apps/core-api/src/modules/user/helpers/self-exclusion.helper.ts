import { ForbiddenException } from '@nestjs/common';
import { SelfExclusionPeriod } from '@common/libs';

import { SELF_EXCLUSION } from '../constants/self-exclusion/self-exclusion.constant';
import { SelfExclusionPeriodDto } from '../dtos/helper/self-exclusion-period.dto';
import { SelfExclusionStateDto } from '../dtos/helper/self-exclusion-state.dto';

export class SelfExclusionHelper {
  static assertNotExcluded ({ selfExclusionUntil }: SelfExclusionStateDto): void {
    if (SelfExclusionHelper.isActive({ selfExclusionUntil })) throw new ForbiddenException(SELF_EXCLUSION.BLOCKED_MESSAGE);
  }

  static isActive ({ selfExclusionUntil }: SelfExclusionStateDto): boolean {
    return !!selfExclusionUntil && new Date(selfExclusionUntil).getTime() > Date.now();
  }

  static until ({ period }: SelfExclusionPeriodDto): string {
    const days = SelfExclusionHelper.days({ period });
    return new Date(Date.now() + days * SELF_EXCLUSION.MS_PER_DAY).toISOString();
  }

  private static days ({ period }: SelfExclusionPeriodDto): number {
    if (period === SelfExclusionPeriod.PERMANENT) return SELF_EXCLUSION.PERMANENT_YEARS * SELF_EXCLUSION.DAYS_PER_YEAR;
    return SELF_EXCLUSION.PERIOD_DAYS[period];
  }
}
