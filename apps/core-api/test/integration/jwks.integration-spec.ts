import { createPublicKey, verify } from 'node:crypto';

import { HTTP_STATUS } from '../constants/http-status.constant';
import { JWKS_TEST as T } from '../constants/jwks.constant';
import { TEST_ENV_KEYS } from '../constants/test-env-keys.constant';
import { ApiHelper } from '../helpers/api.helper';
import { DbHelper } from '../helpers/db.helper';
import { JwksBody, TokenHeader, TokenRefDto } from '../interfaces/jwks.interface';

const rootUrl = (): string => (process.env[TEST_ENV_KEYS.API_URL] as string).replace(T.VERSIONED_SUFFIX, '');

const fetchKeys = async (): Promise<JwksBody> => (await fetch(`${rootUrl()}${T.PATH}`)).json() as Promise<JwksBody>;

const headerOf = ({ token }: TokenRefDto): TokenHeader =>
  JSON.parse(Buffer.from(token.split(T.SEPARATOR)[0] ?? '', T.ENCODING).toString(T.UTF8)) as TokenHeader;

const verifiedWithJwks = async ({ token }: TokenRefDto): Promise<boolean> => {
  const [header = '', payload = '', signature = ''] = token.split(T.SEPARATOR);
  const jwk = (await fetchKeys()).keys.find(key => key.kid === headerOf({ token }).kid);
  if (!jwk) return false;

  const key = createPublicKey({ key: { ...jwk }, format: T.FORMAT });
  return verify(T.SIGNATURE_ALGORITHM, Buffer.from(`${header}${T.SEPARATOR}${payload}`), key, Buffer.from(signature, T.ENCODING));
};

describe('JWKS endpoint', () => {
  afterAll(async () => DbHelper.close());

  it('publishes the token signing key without authentication, outside the versioned API', async () => {
    const response = await fetch(`${rootUrl()}${T.PATH}`);
    const body = (await response.json()) as JwksBody;

    expect(response.status).toBe(HTTP_STATUS.OK);
    expect(body.keys).toHaveLength(T.KEY_COUNT);
    expect(body.keys[0]).toMatchObject({ kty: T.KEY_TYPE, use: T.USE, alg: T.ALGORITHM });
  });

  it('lets another service verify a user access token using only the published key', async () => {
    const token = await ApiHelper.login({ email: T.EMAIL });

    expect(headerOf({ token })).toMatchObject({ alg: T.ALGORITHM, kid: (await fetchKeys()).keys[0]?.kid });
    await expect(verifiedWithJwks({ token })).resolves.toBe(true);
  });

  it('rejects a token whose payload was changed after signing', async () => {
    const [header, , signature] = (await ApiHelper.login({ email: T.EMAIL })).split(T.SEPARATOR);
    const forged = [header, Buffer.from(T.FORGED_PAYLOAD).toString(T.ENCODING), signature].join(T.SEPARATOR);

    await expect(verifiedWithJwks({ token: forged })).resolves.toBe(false);
  });
});
