import { createPublicKey } from 'node:crypto';
import * as jwt from 'jsonwebtoken';
import { CryptoHelper } from '@common/shared-libs';

import { JwksHelper } from '../../src/modules/helpers/jwks.helper';
import { JWKS_SPEC as S } from '../constants/jwks.constant';

const { publicKey, privateKey } = CryptoHelper.generateRsaKeyPair();

describe('JwksHelper', () => {
  it('publishes one RSA signing key whose kid matches the key id used when signing', () => {
    const { keys } = JwksHelper.keySet({ publicKey });

    expect(keys).toHaveLength(S.KEY_COUNT);
    expect(keys[0]).toMatchObject({ kty: S.KEY_TYPE, use: S.USE, alg: S.ALGORITHM, kid: JwksHelper.keyId({ publicKey }) });
  });

  it('gives the same key id for a key stored with escaped newlines, as it is in the environment', () => {
    const escaped = publicKey.split(S.NEWLINE).join(S.ESCAPED_NEWLINE);

    expect(JwksHelper.keyId({ publicKey: escaped })).toBe(JwksHelper.keyId({ publicKey }));
  });

  it('lets a verifier with only the published key check a token signed with the private key', () => {
    const kid = JwksHelper.keyId({ publicKey });
    const token = jwt.sign({ sub: S.SUBJECT }, privateKey, { algorithm: S.ALGORITHM, keyid: kid });
    const header = jwt.decode(token, { complete: true })?.header;
    const jwk = JwksHelper.keySet({ publicKey }).keys.find(key => key.kid === header?.kid);
    const verifierKey = createPublicKey({ key: { ...jwk }, format: S.FORMAT });

    expect(jwt.verify(token, verifierKey, { algorithms: [S.ALGORITHM] })).toMatchObject({ sub: S.SUBJECT });
  });

  it('gives a different key id to a different key', () => {
    const other = CryptoHelper.generateRsaKeyPair().publicKey;

    expect(JwksHelper.keyId({ publicKey: other })).not.toBe(JwksHelper.keyId({ publicKey }));
  });

  it('publishes the previous key next to the current one while it is being rotated out', () => {
    const previous = CryptoHelper.generateRsaKeyPair().publicKey;
    const { keys } = JwksHelper.keySet({ publicKey, previousPublicKey: previous });

    expect(keys).toHaveLength(S.ROTATED_KEY_COUNT);
    expect(keys.map(key => key.kid)).toEqual([JwksHelper.keyId({ publicKey }), JwksHelper.keyId({ publicKey: previous })]);
  });

  it('still verifies a token signed with the previous key, and verifies new tokens with the current key', () => {
    const previous = CryptoHelper.generateRsaKeyPair();
    const keys = { publicKey, previousPublicKey: previous.publicKey };
    const oldToken = jwt.sign({ sub: S.SUBJECT }, previous.privateKey, { algorithm: S.ALGORITHM, keyid: JwksHelper.keyId({ publicKey: previous.publicKey }) });
    const newToken = jwt.sign({ sub: S.SUBJECT }, privateKey, { algorithm: S.ALGORITHM, keyid: JwksHelper.keyId({ publicKey }) });

    expect(jwt.verify(oldToken, JwksHelper.verificationKey({ token: oldToken, ...keys }), { algorithms: [S.ALGORITHM] })).toMatchObject({ sub: S.SUBJECT });
    expect(jwt.verify(newToken, JwksHelper.verificationKey({ token: newToken, ...keys }), { algorithms: [S.ALGORITHM] })).toMatchObject({ sub: S.SUBJECT });
    expect(() => jwt.verify(oldToken, JwksHelper.verificationKey({ token: oldToken, publicKey }), { algorithms: [S.ALGORITHM] })).toThrow();
  });
});
