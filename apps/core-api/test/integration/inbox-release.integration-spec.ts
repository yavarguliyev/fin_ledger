import { Client } from 'pg';
import { INBOX_CONSTANTS } from '@common/database';
import { CryptoHelper } from '@common/shared-libs';

import { DbHelper } from '../helpers/db.helper';
import { INBOX_RELEASE_TEST as T } from '../constants/inbox-release.constant';
import { INTEGRATION_STACK as S } from '../constants/integration-stack.constant';
import { TEST_ENV_KEYS } from '../constants/test-env-keys.constant';

let worker: Client;

beforeAll(async () => {
  const url = new URL(process.env[TEST_ENV_KEYS.APP_DATABASE_URL]!);
  url.username = S.APP_WORKER_USERNAME;
  worker = new Client({ connectionString: url.toString() });

  await worker.connect();
});

afterAll(async () => {
  await worker.end();
});

describe('Inbox claims under the worker login', () => {
  it('releases a claim, so a message whose handler failed is retried instead of skipped', async () => {
    const messageId = CryptoHelper.uuid();

    await worker.query(INBOX_CONSTANTS.MARK_PROCESSED_SQL, [T.CONSUMER, messageId, T.TOPIC]);
    await worker.query(INBOX_CONSTANTS.RELEASE_SQL, [T.CONSUMER, messageId]);

    const rows = await DbHelper.query({ sql: INBOX_CONSTANTS.WAS_PROCESSED_SQL, params: [T.CONSUMER, messageId] });
    expect(rows).toHaveLength(0);
  });
});
