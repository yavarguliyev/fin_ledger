import { setTimeout as sleep } from 'node:timers/promises';
import { CryptoHelper } from '@common/shared-libs';

import { RABBIT_INBOX_TEST as T } from '../constants/rabbit-inbox.constant';
import { DbHelper } from '../helpers/db.helper';
import { RabbitProbe } from '../helpers/rabbit-probe.helper';
import { TestUserHelper } from '../helpers/test-user.helper';

const countNotifications = async (): Promise<number> =>
  (await DbHelper.query<{ count: number }>({ sql: T.COUNT_SQL, params: [T.EMAIL, T.CONTENT_MARKER] }))[0]?.count ?? 0;

beforeAll(async () => {
  await TestUserHelper.ensure({ emails: [T.EMAIL] });
  await DbHelper.query({ sql: T.CLEAN_SQL, params: [T.EMAIL] });
});

afterAll(async () => {
  await DbHelper.query({ sql: T.CLEAN_SQL, params: [T.EMAIL] });
  await DbHelper.close();
});

describe('RabbitMQ consumers and the inbox', () => {
  const probe = RabbitProbe.useInSuite();

  it('creates one notification when the same event is delivered twice', async () => {
    const userId = await TestUserHelper.idOf({ email: T.EMAIL });
    const headers = { [T.EVENT_ID_HEADER]: CryptoHelper.uuid() };
    const payload = { userId, walletId: CryptoHelper.uuid(), amountMinor: T.AMOUNT_MINOR, currency: T.CURRENCY, type: T.ROUTING_KEY };

    await probe().service.publish({ payload, routingKey: T.ROUTING_KEY, headers });
    await probe().service.publish({ payload, routingKey: T.ROUTING_KEY, headers });

    const deadline = Date.now() + T.WAIT_MS;
    while ((await countNotifications()) === 0 && Date.now() < deadline) await sleep(T.POLL_MS);
    await sleep(T.SETTLE_MS);

    expect(await countNotifications()).toBe(1);
  });
});
