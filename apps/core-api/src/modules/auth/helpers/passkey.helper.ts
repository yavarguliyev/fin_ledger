import { PASSKEY } from '../constants/passkeys/passkey.constant';
import { FRONTEND } from '../../../shared/constants/config/frontend.constant';
import { RelyingPartyDto } from '../dtos/passkeys/relying-party.dto';
import { ConfigRefDto } from '../dtos/passkeys/config-ref.dto';
import { CredentialListDto } from '../dtos/passkeys/credential-list.dto';
import { OriginRefDto } from '../dtos/passkeys/origin-ref.dto';
import type { AllowedCredentials } from '../types/allowed-credentials.type';

export class PasskeyHelper {
  static allowed ({ credentials }: CredentialListDto): AllowedCredentials {
    return credentials.map(credential => ({
      id: credential.credentialId,
      ...(credential.transports.length > 0 && { transports: credential.transports })
    }));
  }

  static relyingParty ({ configService }: ConfigRefDto): RelyingPartyDto {
    const origin = configService.get<string>(PASSKEY.ORIGIN_KEY) ?? configService.get<string>(FRONTEND.URL_KEY) ?? PASSKEY.NO_ORIGIN;

    return {
      name: configService.get<string>(PASSKEY.RP_NAME_KEY) ?? PASSKEY.DEFAULT_RP_NAME,
      id: configService.get<string>(PASSKEY.RP_ID_KEY) ?? PasskeyHelper.hostOf({ origin }),
      origin
    };
  }

  private static hostOf ({ origin }: OriginRefDto): string {
    try {
      return new URL(origin).hostname;
    } catch {
      return origin;
    }
  }
}
