import { CORRELATION } from '@common/shared-libs';
import { CryptoHelper } from '@common/shared-libs';

import { CORRELATION_ID_TEST as T } from '../constants/correlation-id.constant';
import { TEST_ENV_KEYS } from '../constants/test-env-keys.constant';
import { DbHelper } from '../helpers/db.helper';
import { TracedOutboxRow } from '../interfaces/correlation-id.interface';

const apiUrl = (): string => process.env[TEST_ENV_KEYS.API_URL] as string;

describe('Correlation IDs', () => {
  afterAll(async () => DbHelper.close());

  it("echoes the caller's id back and stamps it on the outbox rows the request wrote", async () => {
    const correlationId = CryptoHelper.uuid();
    const email = `${T.EMAIL_PREFIX}${correlationId}${T.EMAIL_DOMAIN}`;

    const response = await fetch(`${apiUrl()}${T.REGISTER_PATH}`, {
      method: T.POST,
      headers: { [T.CONTENT_TYPE]: T.JSON, [CORRELATION.HEADER]: correlationId },
      body: JSON.stringify({ email, password: T.PASSWORD, displayName: T.DISPLAY_NAME, termsAccepted: true })
    });

    expect(response.status).toBe(T.CREATED);
    expect(response.headers.get(CORRELATION.HEADER)).toBe(correlationId);

    const rows = await DbHelper.query<TracedOutboxRow>({ sql: T.OUTBOX_SQL, params: [correlationId] });

    expect(rows.length).toBeGreaterThan(T.NO_ROWS);
    rows.forEach(row => expect(row.trace_id).toBe(correlationId));
  });

  it('issues an id when the caller does not supply one', async () => {
    const response = await fetch(`${apiUrl()}${T.PUBLIC_PATH}`);
    const issued = response.headers.get(CORRELATION.HEADER);

    expect(issued).toBeTruthy();
    expect(issued).not.toBe(T.EMPTY);
  });
});
