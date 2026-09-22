import { Injectable } from '@nestjs/common';
import { BaseRepository, PostgresService } from '@common/libs';

import { TrialBalanceRowDto } from '../dtos/integrity/trial-balance-row.dto';
import { LEDGER_INTEGRITY } from '../constants/jobs/ledger-integrity.constant';

@Injectable()
export class TrialBalanceRepository extends BaseRepository<TrialBalanceRowDto> {
  constructor (postgresService: PostgresService) {
    super({
      service: postgresService,
      tableName: LEDGER_INTEGRITY.VIEWS.TRIAL_BALANCE,
      columnMappings: { totalDebitsMinor: 'total_debits_minor', totalCreditsMinor: 'total_credits_minor', netMinor: 'net_minor' }
    });
  }

  protected getSelectColumns (): string[] {
    return ['currency', 'totalDebitsMinor', 'totalCreditsMinor', 'netMinor'];
  }

  async findUnbalanced (): Promise<TrialBalanceRowDto[]> {
    return this.findAll({ where: [{ field: 'netMinor', operator: '!=', value: 0 }] });
  }
}
