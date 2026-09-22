import { TEST_ENV_KEYS } from '../constants/test-env-keys.constant';
import { TEST_ORIGINS } from '../constants/test-origins.constant';
import { ApiHelper } from '../helpers/api.helper';

describe('HTTP hardening', () => {
  const preflight = (origin: string): Promise<Response> =>
    fetch(`${process.env[TEST_ENV_KEYS.API_URL]}/auth/login`, {
      method: 'OPTIONS',
      headers: { Origin: origin, 'Access-Control-Request-Method': 'POST', 'Access-Control-Request-Headers': 'content-type' }
    });

  it('allows credentialed CORS only from the configured origins', async () => {
    const allowed = await preflight(TEST_ORIGINS.FRONTEND);
    expect(allowed.headers.get('access-control-allow-origin')).toBe(TEST_ORIGINS.FRONTEND);
    expect(allowed.headers.get('access-control-allow-credentials')).toBe('true');

    const foreign = await preflight(TEST_ORIGINS.FOREIGN);
    expect(foreign.headers.get('access-control-allow-origin')).toBeNull();
  });

  it('sends the helmet security headers', async () => {
    const { headers } = await ApiHelper.request({ method: 'POST', path: '/auth/login', body: {} });

    expect(headers.get('x-content-type-options')).toBe('nosniff');
    expect(headers.get('x-frame-options')).toBe('SAMEORIGIN');
    expect(headers.get('strict-transport-security')).toContain('max-age=');
    expect(headers.get('content-security-policy')).toContain("default-src 'self'");
    expect(headers.get('x-powered-by')).toBeNull();
  });

  it('rejects a JSON body over the limit with 413', async () => {
    const response = await fetch(`${process.env[TEST_ENV_KEYS.API_URL]}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'a@b.c', password: 'x'.repeat(200 * 1024) })
    });

    expect(response.status).toBe(413);
    await expect(response.json()).resolves.toMatchObject({ error: { code: 'HTTP_413', retryable: false } });
  });

  it('rejects malformed JSON with 400, not 500', async () => {
    const response = await fetch(`${process.env[TEST_ENV_KEYS.API_URL]}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{"email":'
    });

    expect(response.status).toBe(400);
  });
});
