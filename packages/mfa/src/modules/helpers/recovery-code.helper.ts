import { CryptoHelper } from '@common/shared-libs';

import { RECOVERY_CODES } from '../constants/recovery/recovery-codes.constant';
import { RecoveryCodeDto } from '../dtos/recovery/recovery-code.dto';
import { RecoveryCodeSetDto } from '../dtos/recovery/recovery-code-set.dto';

export class RecoveryCodeHelper {
  private static readonly ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

  static generate (): RecoveryCodeSetDto {
    const codes = Array.from({ length: RECOVERY_CODES.COUNT }, () => `${RecoveryCodeHelper.group()}-${RecoveryCodeHelper.group()}`);
    return { codes, hashes: codes.map(code => RecoveryCodeHelper.hash({ code })) };
  }

  static hash ({ code }: RecoveryCodeDto): string {
    const normalized = code.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
    return CryptoHelper.sha256({ value: normalized });
  }

  private static group (): string {
    const alphabet = RecoveryCodeHelper.ALPHABET;
    return Array.from(CryptoHelper.randomBytes({ bytes: RECOVERY_CODES.GROUP_LENGTH }), byte => alphabet[byte % alphabet.length]).join('');
  }
}
