import { Injectable } from '@nestjs/common';

import { LedgerIntegrityJob } from '../../jobs/ledger-integrity.job';
import { LedgerIntegrityReportDto } from '../../dtos/integrity/ledger-integrity-report.dto';
import { LedgerBaseUseCase } from '../base/base-ledger.use-case';

@Injectable()
export class GetLedgerIntegrityUseCase extends LedgerBaseUseCase<void, LedgerIntegrityReportDto> {
  constructor (private readonly ledgerIntegrityJob: LedgerIntegrityJob) {
    super();
  }

  async execute (): Promise<LedgerIntegrityReportDto> {
    return this.ledgerIntegrityJob.check();
  }
}
