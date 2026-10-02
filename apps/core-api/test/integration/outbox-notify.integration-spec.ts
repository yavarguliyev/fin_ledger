import { Client } from 'pg';

import { OUTBOX_NOTIFY_TEST as T } from '../constants/outbox-notify.constant';
import { TEST_ENV_KEYS } from '../constants/test-env-keys.constant';
import { DbHelper } from '../helpers/db.helper';

describe('Outbox insert notification', () => {
  let probeId = '';

  afterAll(async () => {
    if (probeId) await DbHelper.query({ sql: T.CLEANUP_SQL, params: [probeId] });
    await DbHelper.close();
  });

  it('notifies listeners when an outbox event is written, so the relay can publish without waiting for its next poll', async () => {
    const listener = new Client({ connectionString: process.env[TEST_ENV_KEYS.DATABASE_URL] as string });
    await listener.connect();
    await listener.query(T.LISTEN_SQL);

    try {
      const notified = new Promise<string>((resolve, reject) => {
        const timer = setTimeout(() => reject(new Error('No outbox notification')), T.TIMEOUT_MS);
        listener.on(T.NOTIFICATION_EVENT, ({ channel }) => {
          clearTimeout(timer);
          resolve(channel);
        });
      });

      const [row] = await DbHelper.query<{ id: string }>({ sql: T.INSERT_SQL });
      probeId = row?.id as string;

      await expect(notified).resolves.toBe(T.CHANNEL);
    } finally {
      await listener.end();
    }
  });
});
