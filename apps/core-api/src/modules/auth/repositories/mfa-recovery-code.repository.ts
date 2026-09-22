import { Injectable } from '@nestjs/common';

import { MFA_RECOVERY_CODE_CONSTANTS } from '../constants/mfa/mfa-recovery-code.constant';
import { ReplaceRecoveryCodesDto } from '../dtos/repository/replace-recovery-codes.dto';
import { RetireRecoveryCodesDto } from '../dtos/repository/retire-recovery-codes.dto';
import { ClaimRecoveryCodeDto } from '../dtos/repository/claim-recovery-code.dto';

@Injectable()
export class MfaRecoveryCodeRepository {
  async replace ({ userId, hashes, adapter }: ReplaceRecoveryCodesDto): Promise<void> {
    await this.retire({ userId, adapter });
    await adapter.query({ sql: MFA_RECOVERY_CODE_CONSTANTS.INSERT_SQL, params: [userId, hashes] });
  }

  async retire ({ userId, adapter }: RetireRecoveryCodesDto): Promise<void> {
    await adapter.query({ sql: MFA_RECOVERY_CODE_CONSTANTS.RETIRE_UNUSED_SQL, params: [userId] });
  }

  async claim ({ userId, codeHash, adapter }: ClaimRecoveryCodeDto): Promise<boolean> {
    const result = await adapter.query({ sql: MFA_RECOVERY_CODE_CONSTANTS.CLAIM_SQL, params: [userId, codeHash] });
    return result.rowCount > 0;
  }
}
