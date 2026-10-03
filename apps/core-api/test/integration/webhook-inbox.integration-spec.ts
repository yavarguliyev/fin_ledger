import { setTimeout as sleep } from 'node:timers/promises';

import { WEBHOOK_INBOX } from '../constants/webhook-inbox.constant';
import { ApiHelper } from '../helpers/api.helper';
import { DbHelper } from '../helpers/db.helper';
import { InboxDepositDto, InboxEventDto, InboxIdRow, InboxPaymentDto, InboxStatusRow, InboxWebhookDto } from '../interfaces/webhook-inbox.interface';

const send = ({ id, type, paymentId }: InboxWebhookDto): ReturnType<typeof ApiHelper.request> =>
  ApiHelper.request({
    method: 'POST',
    path: WEBHOOK_INBOX.WEBHOOK_PATH,
    body: { id, type, data: { object: { id: `${WEBHOOK_INBOX.CHARGE_PREFIX}${id}`, metadata: paymentId ? { paymentId } : {} } } }
  });

const eventRow = async ({ eventId }: InboxEventDto): Promise<unknown> => {
  const [row] = await DbHelper.query({ sql: WEBHOOK_INBOX.EVENT_ROW_SQL, params: [WEBHOOK_INBOX.PROVIDER, eventId] });
  return row;
};

const paymentStatus = async ({ paymentId }: InboxPaymentDto): Promise<string | undefined> => {
  const [row] = await DbHelper.query<InboxStatusRow>({ sql: WEBHOOK_INBOX.STATUS_SQL, params: [paymentId] });
  return row?.status;
};

const pendingDeposit = async ({ amount, key }: InboxDepositDto): Promise<string> => {
  const [row] = await DbHelper.query<InboxIdRow>({ sql: WEBHOOK_INBOX.PENDING_DEPOSIT_SQL, params: [WEBHOOK_INBOX.EMAIL, key, amount] });
  return row?.id as string;
};

beforeAll(async () => {
  await DbHelper.query({ sql: WEBHOOK_INBOX.CREATE_FUNCTION_SQL });
  await DbHelper.query({ sql: WEBHOOK_INBOX.CREATE_TRIGGER_SQL });
});

afterAll(async () => {
  await DbHelper.query({ sql: WEBHOOK_INBOX.DROP_TRIGGER_SQL });
  await DbHelper.query({ sql: WEBHOOK_INBOX.DROP_FUNCTION_SQL });
  await DbHelper.close();
});

describe('Webhook inbox', () => {
  it('leaves a webhook whose handling failed retryable, and applies it once on redelivery', async () => {
    const paymentId = await pendingDeposit({ amount: WEBHOOK_INBOX.FAILING_AMOUNT, key: WEBHOOK_INBOX.CRASH_KEY });
    const crash = { id: WEBHOOK_INBOX.CRASH_EVENT, type: WEBHOOK_INBOX.SUCCEEDED, paymentId };

    await expect(send(crash)).resolves.toMatchObject({ status: WEBHOOK_INBOX.SERVER_ERROR });
    await expect(eventRow({ eventId: WEBHOOK_INBOX.CRASH_EVENT })).resolves.toEqual(WEBHOOK_INBOX.RECEIVED_ONCE);
    await expect(paymentStatus({ paymentId })).resolves.toBe(WEBHOOK_INBOX.PENDING);
    await DbHelper.query({ sql: WEBHOOK_INBOX.DROP_TRIGGER_SQL });
    await expect(send(crash)).resolves.toMatchObject({ status: WEBHOOK_INBOX.OK });
    await expect(eventRow({ eventId: WEBHOOK_INBOX.CRASH_EVENT })).resolves.toEqual(WEBHOOK_INBOX.PROCESSED_TWICE);
    await expect(paymentStatus({ paymentId })).resolves.toBe(WEBHOOK_INBOX.COMPLETED);
  });

  it('replays a webhook whose handling failed, without a redelivery', async () => {
    const paymentId = await pendingDeposit({ amount: WEBHOOK_INBOX.FAILING_AMOUNT, key: WEBHOOK_INBOX.REPLAY_KEY });

    await DbHelper.query({ sql: WEBHOOK_INBOX.CREATE_TRIGGER_SQL });

    await expect(send({ id: WEBHOOK_INBOX.REPLAY_EVENT, type: WEBHOOK_INBOX.SUCCEEDED, paymentId })).resolves.toMatchObject({
      status: WEBHOOK_INBOX.SERVER_ERROR
    });
    await DbHelper.query({ sql: WEBHOOK_INBOX.DROP_TRIGGER_SQL });

    const deadline = Date.now() + WEBHOOK_INBOX.REPLAY_DEADLINE_MS;
    while ((await paymentStatus({ paymentId })) !== WEBHOOK_INBOX.COMPLETED && Date.now() < deadline) await sleep(WEBHOOK_INBOX.REPLAY_POLL_MS);

    await expect(paymentStatus({ paymentId })).resolves.toBe(WEBHOOK_INBOX.COMPLETED);
    await expect(eventRow({ eventId: WEBHOOK_INBOX.REPLAY_EVENT })).resolves.toEqual(WEBHOOK_INBOX.PROCESSED_TWICE);
  }, WEBHOOK_INBOX.REPLAY_TIMEOUT_MS);

  it('does not apply a processed webhook again', async () => {
    const paymentId = await pendingDeposit({ amount: WEBHOOK_INBOX.DUPLICATE_AMOUNT, key: WEBHOOK_INBOX.DUPLICATE_KEY });
    const duplicate = { id: WEBHOOK_INBOX.DUPLICATE_EVENT, type: WEBHOOK_INBOX.SUCCEEDED, paymentId };

    await send(duplicate);
    await send(duplicate);

    await expect(eventRow({ eventId: WEBHOOK_INBOX.DUPLICATE_EVENT })).resolves.toEqual(WEBHOOK_INBOX.PROCESSED_TWICE);
    await expect(DbHelper.query({ sql: WEBHOOK_INBOX.TRANSACTION_COUNT_SQL, params: [paymentId] })).resolves.toEqual(WEBHOOK_INBOX.ONE_TRANSACTION);
  });
});

describe('Webhook inbox: unhandled events', () => {
  it('marks event types we do not handle as ignored', async () => {
    await expect(send({ id: WEBHOOK_INBOX.UNHANDLED_EVENT, type: WEBHOOK_INBOX.UNHANDLED_TYPE })).resolves.toMatchObject({ status: WEBHOOK_INBOX.OK });
    await expect(eventRow({ eventId: WEBHOOK_INBOX.UNHANDLED_EVENT })).resolves.toEqual(WEBHOOK_INBOX.IGNORED_ONCE);
  });
});
