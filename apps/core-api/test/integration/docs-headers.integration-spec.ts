import { DOCS_HEADERS_TEST as T } from '../constants/docs-headers.constant';
import { TEST_ENV_KEYS } from '../constants/test-env-keys.constant';

describe('API docs headers', () => {
  it('keeps the default policy on the API docs so Swagger UI can load its scripts', async () => {
    const root = (process.env[TEST_ENV_KEYS.API_URL] as string).replace(T.API_SUFFIX, '');
    const response = await fetch(`${root}${T.DOCS_PATH}`);

    expect(response.status).toBe(T.OK);
    expect(response.headers.get(T.CSP_HEADER)).toContain(T.DEFAULT_POLICY);
  });
});
