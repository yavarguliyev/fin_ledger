import { Injectable } from '@nestjs/common';
import { BaseExtendedRepository, PostgresService } from '@common/libs';

import { MfaRecoveryCodeDto } from '../dtos/mfa/mfa-recovery-code.dto';
import { ReplaceRecoveryCodesDto } from '../dtos/repository/replace-recovery-codes.dto';
import { RetireRecoveryCodesDto } from '../dtos/repository/retire-recovery-codes.dto';
import { ClaimRecoveryCodeDto } from '../dtos/repository/claim-recovery-code.dto';

@Injectable()
export class MfaRecoveryCodeRepository extends BaseExtendedRepository<MfaRecoveryCodeDto> {
  constructor (postgresService: PostgresService) {
    super({
      service: postgresService,
      tableName: 'mfa_recovery_codes',
      columnMappings: {
        userId: 'user_id',
        codeHash: 'code_hash',
        usedAt: 'used_at',
        createdAt: 'created_at'
      }
    });
  }

  protected getSelectColumns (): string[] {
    return ['id', 'userId', 'codeHash', 'usedAt', 'createdAt'];
  }

  async replace ({ userId, hashes, adapter }: ReplaceRecoveryCodesDto): Promise<void> {
    await this.retire({ userId, adapter });

    for (const codeHash of hashes) {
      await this.create({ data: { userId, codeHash }, adapter });
    }
  }

  async retire ({ userId, adapter }: RetireRecoveryCodesDto): Promise<void> {
    await this.updateWhere({ where: { userId, usedAt: null }, data: { usedAt: new Date().toISOString() }, adapter });
  }

  async claim ({ userId, codeHash, adapter }: ClaimRecoveryCodeDto): Promise<boolean> {
    const claimed = await this.updateWhere({ where: { userId, codeHash, usedAt: null }, data: { usedAt: new Date().toISOString() }, adapter });
    return claimed !== null;
  }
}
