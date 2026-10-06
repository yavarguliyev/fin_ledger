import { HTTP_HARDENING_TEST as T } from '../constants/http-hardening.constant';
import { TEST_ENV_KEYS } from '../constants/test-env-keys.constant';
import { TEST_ORIGINS } from '../constants/test-origins.constant';
import { ApiHelper } from '../helpers/api.helper';
import { PreflightOrigin } from '../interfaces/http-hardening.interface';

describe('HTTP hardening', () => {
  const loginUrl = (): string => `${process.env[TEST_ENV_KEYS.API_URL]}${T.LOGIN_PATH}`;

  const preflight = ({ origin }: PreflightOrigin): Promise<Response> =>
    fetch(loginUrl(), { method: T.OPTIONS, headers: { [T.ORIGIN_HEADER]: origin, ...T.PREFLIGHT_HEADERS } });

  it('allows credentialed CORS only from the configured origins', async () => {
    const allowed = await preflight({ origin: TEST_ORIGINS.FRONTEND });
    expect(allowed.headers.get(T.ALLOW_ORIGIN)).toBe(TEST_ORIGINS.FRONTEND);
    expect(allowed.headers.get(T.ALLOW_CREDENTIALS)).toBe(T.TRUE);

    const foreign = await preflight({ origin: TEST_ORIGINS.FOREIGN });
    expect(foreign.headers.get(T.ALLOW_ORIGIN)).toBeNull();
  });

  it('sends the helmet security headers', async () => {
    const { headers } = await ApiHelper.request({ method: T.POST, path: T.LOGIN_PATH, body: {} });

    Object.entries(T.SECURITY_HEADERS).forEach(([name, value]) => expect(headers.get(name)).toBe(value));
    T.CSP_DIRECTIVES.forEach(directive => expect(headers.get(T.CSP)).toContain(directive));
    expect(headers.get(T.POWERED_BY)).toBeNull();
  });

  it('rejects a JSON body over the limit with 413', async () => {
    const response = await fetch(loginUrl(), {
      method: T.POST,
      headers: T.JSON_HEADERS,
      body: JSON.stringify({ email: T.OVERSIZED_EMAIL, password: T.FILLER.repeat(T.OVERSIZED_BYTES) })
    });

    expect(response.status).toBe(T.PAYLOAD_TOO_LARGE);
    await expect(response.json()).resolves.toMatchObject(T.TOO_LARGE_ERROR);
  });

  it('rejects malformed JSON with 400, not 500', async () => {
    const response = await fetch(loginUrl(), { method: T.POST, headers: T.JSON_HEADERS, body: T.MALFORMED_JSON });

    expect(response.status).toBe(T.BAD_REQUEST);
  });
});
