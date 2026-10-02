import { browserSupportsWebAuthn, platformAuthenticatorIsAvailable } from '@simplewebauthn/browser';

import { PASSKEY } from '../../constants/passkey/passkey.constant';
import { CaughtErrorDto } from '../../interfaces/common/caught-error.interface';

export class PasskeyHelper {
  static isAvailable (): boolean {
    return browserSupportsWebAuthn();
  }

  static isCancellation ({ error }: CaughtErrorDto): boolean {
    const name = error instanceof Error ? error.name : '';
    return (PASSKEY.CANCELLED_ERRORS as readonly string[]).includes(name);
  }

  static deviceLabel (): string {
    const agent = typeof navigator === 'undefined' ? '' : navigator.userAgent;
    const match = PASSKEY.LABELS.find(([keyword]) => agent.includes(keyword));
    return (match?.[1] ?? PASSKEY.DEFAULT_LABEL).slice(0, PASSKEY.LABEL_MAX_LENGTH);
  }

  static owner (): string {
    const bytes = new Uint8Array(PASSKEY.OWNER_BYTES);
    crypto.getRandomValues(bytes);
    return Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  static async isPlatformAvailable (): Promise<boolean> {
    if (!browserSupportsWebAuthn()) return false;

    try {
      return await platformAuthenticatorIsAvailable();
    } catch {
      return false;
    }
  }
}
