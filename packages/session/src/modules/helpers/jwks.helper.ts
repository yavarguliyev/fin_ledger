import { createHash, createPublicKey } from 'node:crypto';

import { JWKS } from '../constants/auth/jwks.constant';
import { PemKeyDto } from '../dtos/helper/pem-key.dto';
import { PublicKeyDto } from '../dtos/helper/public-key.dto';
import { PublicJwk, PublicJwkSet } from '../interfaces/public-jwk.interface';

export class JwksHelper {
  static pem ({ key }: PemKeyDto): string {
    return key.replace(JWKS.ESCAPED_NEWLINE, JWKS.NEWLINE);
  }

  static keyId ({ publicKey }: PublicKeyDto): string {
    const { n, e } = JwksHelper.components({ publicKey });
    return createHash(JWKS.DIGEST).update(JSON.stringify({ e, kty: JWKS.KEY_TYPE, n })).digest(JWKS.ENCODING);
  }

  static keySet ({ publicKey }: PublicKeyDto): PublicJwkSet {
    const { n, e } = JwksHelper.components({ publicKey });
    const key: PublicJwk = { kty: JWKS.KEY_TYPE, use: JWKS.USE, alg: JWKS.ALGORITHM, kid: JwksHelper.keyId({ publicKey }), n, e };
    return { keys: [key] };
  }

  private static components ({ publicKey }: PublicKeyDto): Pick<PublicJwk, 'n' | 'e'> {
    const { n = '', e = '' } = createPublicKey(JwksHelper.pem({ key: publicKey })).export({ format: JWKS.FORMAT });
    return { n, e };
  }
}
