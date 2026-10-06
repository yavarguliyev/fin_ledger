import { createHash, createPublicKey } from 'node:crypto';
import * as jwt from 'jsonwebtoken';

import { JWKS } from '../constants/auth/jwks.constant';
import { PemKeyDto } from '../dtos/helper/pem-key.dto';
import { PublicKeyDto } from '../dtos/helper/public-key.dto';
import { SigningKeysDto } from '../dtos/helper/signing-keys.dto';
import { VerificationKeyDto } from '../dtos/helper/verification-key.dto';
import { PublicJwk, PublicJwkSet } from '../interfaces/public-jwk.interface';

export class JwksHelper {
  static pem ({ key }: PemKeyDto): string {
    return key.replace(JWKS.ESCAPED_NEWLINE, JWKS.NEWLINE);
  }

  static keyId ({ publicKey }: PublicKeyDto): string {
    const { n, e } = JwksHelper.components({ publicKey });
    return createHash(JWKS.DIGEST).update(JSON.stringify({ e, kty: JWKS.KEY_TYPE, n })).digest(JWKS.ENCODING);
  }

  static keySet ({ publicKey, previousPublicKey }: SigningKeysDto): PublicJwkSet {
    const keys = [publicKey, ...(previousPublicKey ? [previousPublicKey] : [])];
    return { keys: keys.map(key => JwksHelper.jwk({ publicKey: key })) };
  }

  static verificationKey ({ token, publicKey, previousPublicKey }: VerificationKeyDto): string {
    const kid = jwt.decode(token, { complete: true })?.header.kid;
    const previous = previousPublicKey && kid === JwksHelper.keyId({ publicKey: previousPublicKey });
    return JwksHelper.pem({ key: previous ? previousPublicKey : publicKey });
  }

  private static jwk ({ publicKey }: PublicKeyDto): PublicJwk {
    const { n, e } = JwksHelper.components({ publicKey });
    return { kty: JWKS.KEY_TYPE, use: JWKS.USE, alg: JWKS.ALGORITHM, kid: JwksHelper.keyId({ publicKey }), n, e };
  }

  private static components ({ publicKey }: PublicKeyDto): Pick<PublicJwk, 'n' | 'e'> {
    const { n = '', e = '' } = createPublicKey(JwksHelper.pem({ key: publicKey })).export({ format: JWKS.FORMAT });
    return { n, e };
  }
}
