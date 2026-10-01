import { Injectable } from '@nestjs/common';
import { BaseRepository, PostgresService } from '@common/libs';

import { DriftRowDto } from '../dtos/integrity/drift-row.dto';
import { LEDGER_INTEGRITY } from '../constants/jobs/ledger-integrity.constant';

@Injectable()
export class WalletLedgerDriftRepository extends BaseRepository<DriftRowDto> {
  constructor (postgresService: PostgresService) {
    super({ service: postgresService, tableName: LEDGER_INTEGRITY.VIEWS.WALLET_DRIFT });
  }

  protected getSelectColumns (): string[] {
    return ['currency'];
  }
}
