import { LoginResultRefDto } from '../../dtos/auth/login-result-ref.dto';
import { RecoveryCodesFileDto } from '../../dtos/auth/recovery-codes-file.dto';
import { RecoveryCodesRefDto } from '../../dtos/auth/recovery-codes-ref.dto';
import { MFA_CODES } from '../../constants/auth/mfa-codes.constant';
import { AuthResponse } from '../../interfaces/auth/auth-response.interface';
import { MfaChallenge } from '../../interfaces/auth/mfa-challenge.interface';

export class MfaHelper {
  static challengeOf ({ result }: LoginResultRefDto): MfaChallenge | null {
    return 'mfaRequired' in result ? result : null;
  }

  static sessionOf ({ result }: LoginResultRefDto): AuthResponse | null {
    return 'accessToken' in result ? result : null;
  }

  static async copyRecoveryCodes ({ codes }: RecoveryCodesRefDto): Promise<void> {
    await navigator.clipboard.writeText(codes.join(MFA_CODES.SEPARATOR));
  }

  static downloadRecoveryCodes ({ codes, accountName }: RecoveryCodesFileDto): void {
    const content = [`Recovery codes for ${accountName}`, 'Each code works once. Keep them somewhere safe.', '', ...codes].join(MFA_CODES.SEPARATOR);
    const url = URL.createObjectURL(new Blob([content], { type: MFA_CODES.MIME_TYPE }));
    const link = document.createElement('a');

    link.href = url;
    link.download = MFA_CODES.FILE_NAME;
    link.click();

    URL.revokeObjectURL(url);
  }
}
