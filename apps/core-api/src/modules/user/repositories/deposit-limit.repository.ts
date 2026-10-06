import { Injectable } from '@nestjs/common';
import { BaseRepository, PostgresService } from '@common/libs';

import { DepositLimitDto } from '../dtos/deposit-limits/deposit-limit.dto';
import { UserIdRequestDto } from '../dtos/request/user-id-request.dto';
import { SpentInPeriodDto } from '../dtos/deposit-limits/spent-in-period.dto';
import { SpentRowDto } from '../dtos/deposit-limits/spent-row.dto';
import { DEPOSIT_LIMIT } from '../constants/deposit-limits/deposit-limit.constant';

@Injectable()
export class DepositLimitRepository extends BaseRepository<DepositLimitDto> {
  constructor (postgresService: PostgresService) {
    super({
      service: postgresService,
      tableName: 'deposit_limits',
      columnMappings: {
        userId: 'user_id',
        amountMinor: 'amount_minor',
        pendingAmountMinor: 'pending_amount_minor',
        pendingEffectiveAt: 'pending_effective_at',
        createdAt: 'created_at',
        updatedAt: 'updated_at'
      }
    });
  }

  protected getSelectColumns (): string[] {
    return ['id', 'userId', 'period', 'currency', 'amountMinor', 'pendingAmountMinor', 'pendingEffectiveAt', 'createdAt', 'updatedAt'];
  }

  async findForUser ({ userId }: UserIdRequestDto): Promise<DepositLimitDto[]> {
    return this.findAll({ where: { userId } });
  }

  async spentInPeriod ({ userId, currency, period }: SpentInPeriodDto): Promise<SpentRowDto | null> {
    const result = await this.service.getConnection().query<SpentRowDto>({
      sql: DEPOSIT_LIMIT.SPENT_SQL,
      params: [userId, currency, DEPOSIT_LIMIT.PERIOD_TRUNC[period], DEPOSIT_LIMIT.EXCLUDED_STATUSES]
    });

    return result.rows[0] ?? null;
  }
}
