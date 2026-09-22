import { LoginResultRefDto } from '../../dtos/auth/login-result-ref.dto';
import { RecoveryCodesFileDto } from '../../dtos/auth/recovery-codes-file.dto';
import { AuthResponse } from '../../interfaces/auth/auth-response.interface';
import { MfaChallenge } from '../../interfaces/auth/mfa-challenge.interface';

export class MfaHelper {
  static challengeOf ({ result }: LoginResultRefDto): MfaChallenge | null {
    return 'mfaRequired' in result ? result : null;
  }

  static sessionOf ({ result }: LoginResultRefDto): AuthResponse | null {
    return 'accessToken' in result ? result : null;
  }

  static downloadRecoveryCodes ({ codes, accountName }: RecoveryCodesFileDto): void {
    const content = [`Recovery codes for ${accountName}`, 'Each code works once. Keep them somewhere safe.', '', ...codes].join('\n');
    const url = URL.createObjectURL(new Blob([content], { type: 'text/plain' }));
    const link = document.createElement('a');

    link.href = url;
    link.download = 'recovery-codes.txt';
    link.click();

    URL.revokeObjectURL(url);
  }
}
