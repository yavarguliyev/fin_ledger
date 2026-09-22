import { BadRequestException } from '@nestjs/common';
import { RecoveryCodeHelper } from '@common/libs';

import { SecondFactorResultDto } from '../dtos/helper/second-factor-result.dto';
import { VerifySecondFactorDto } from '../dtos/helper/verify-second-factor.dto';

export class MfaHelper {
  private static readonly TOTP_PATTERN = /^\d{6}$/;

  static async verifySecondFactor ({ user, code, totpService, mfaRecoveryCodeRepository, adapter }: VerifySecondFactorDto): Promise<SecondFactorResultDto> {
    if (!user.mfaSecretEncrypted) throw new BadRequestException('Two-factor authentication is not set up');

    const trimmed = code.replace(/\s/g, '');

    if (MfaHelper.TOTP_PATTERN.test(trimmed)) {
      const secret = totpService.decryptSecret({ encrypted: user.mfaSecretEncrypted });
      const { valid, timeStep } = totpService.verify({ secret, code: trimmed, lastUsedStep: user.mfaLastUsedStep });
      if (valid && timeStep !== undefined) return { method: 'totp', timeStep };
    } else if (user.mfaEnabledAt) {
      const claimed = await mfaRecoveryCodeRepository.claim({ userId: user.id, codeHash: RecoveryCodeHelper.hash({ code }), adapter });
      if (claimed) return { method: 'recovery_code' };
    }

    throw new BadRequestException('Invalid authentication code');
  }
}
