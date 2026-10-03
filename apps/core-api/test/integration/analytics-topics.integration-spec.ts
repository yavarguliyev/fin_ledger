import { ANALYTICS_TOPICS_TEST } from '../constants/analytics-topics.constant';
import { ApiHelper } from '../helpers/api.helper';
import { DbHelper } from '../helpers/db.helper';

let token = '';

let methodId = '';

let wallet = { id: '', currency: '' };

const produced = async (eventType: string): Promise<number> => {
  const [row] = await DbHelper.query<{ count: number }>({ sql: ANALYTICS_TOPICS_TEST.COUNT_SQL, params: [eventType] });

  return row?.count ?? 0;
};

const webhook = (type: string, chargeId: string): ReturnType<typeof ApiHelper.request> =>
  ApiHelper.request({
    method: 'POST',
    path: ANALYTICS_TOPICS_TEST.WEBHOOK_PATH,
    body: { id: `evt_${type}_${chargeId}`, type, data: { object: { id: chargeId, metadata: {} } } }
  });

const deposit = (idempotencyKey: string): ReturnType<typeof ApiHelper.request<{ id: string; providerChargeId: string }>> =>
  ApiHelper.request<{ id: string; providerChargeId: string }>({
    method: 'POST',
    path: ANALYTICS_TOPICS_TEST.DEPOSIT_PATH,
    token,
    body: { amountMinor: ANALYTICS_TOPICS_TEST.DEPOSIT_MINOR, currency: wallet.currency, idempotencyKey, paymentMethodId: methodId }
  });

beforeAll(async () => {
  const [found] = await DbHelper.query<{ id: string; currency: string }>({
    sql: ANALYTICS_TOPICS_TEST.WALLET_SQL,
    params: [ANALYTICS_TOPICS_TEST.EMAIL]
  });

  wallet = { id: found?.id ?? '', currency: found?.currency ?? '' };

  const [method] = await DbHelper.query<{ id: string }>({ sql: ANALYTICS_TOPICS_TEST.METHOD_SQL, params: [ANALYTICS_TOPICS_TEST.EMAIL] });

  methodId = method?.id ?? '';
  token = await ApiHelper.login({ email: ANALYTICS_TOPICS_TEST.EMAIL });
});

afterAll(async () => DbHelper.close());

describe('Analytics topics', () => {
  it('writes the completed and credited analytics events when a deposit succeeds', async () => {
    const before = {
      completed: await produced(ANALYTICS_TOPICS_TEST.PAYMENT_COMPLETED),
      credited: await produced(ANALYTICS_TOPICS_TEST.WALLET_CREDITED)
    };
    const created = await deposit('analytics-topics-success');

    expect(created.status).toBe(ANALYTICS_TOPICS_TEST.CREATED);

    await webhook(ANALYTICS_TOPICS_TEST.SUCCEEDED_EVENT, created.body.providerChargeId);

    expect(await produced(ANALYTICS_TOPICS_TEST.PAYMENT_COMPLETED)).toBe(before.completed + 1);
    expect(await produced(ANALYTICS_TOPICS_TEST.WALLET_CREDITED)).toBe(before.credited + 1);
  });

  it('writes the failed analytics event when a deposit fails, so the consumer is reachable', async () => {
    const before = await produced(ANALYTICS_TOPICS_TEST.PAYMENT_FAILED);

    await DbHelper.query({
      sql: ANALYTICS_TOPICS_TEST.SEED_PROCESSING_SQL,
      params: [ANALYTICS_TOPICS_TEST.EMAIL, wallet.id, methodId, wallet.currency, ANALYTICS_TOPICS_TEST.FAILING_CHARGE_ID]
    });

    await webhook(ANALYTICS_TOPICS_TEST.FAILED_EVENT, ANALYTICS_TOPICS_TEST.FAILING_CHARGE_ID);

    expect(await produced(ANALYTICS_TOPICS_TEST.PAYMENT_FAILED)).toBe(before + 1);
  });
});

describe('Analytics topics for bets', () => {
  it('writes the debited analytics event for a bet placed inside its own transaction', async () => {
    const before = await produced(ANALYTICS_TOPICS_TEST.WALLET_DEBITED);
    const [event] = await DbHelper.query<{ id: string }>({ sql: ANALYTICS_TOPICS_TEST.EVENT_SQL });

    const bet = await ApiHelper.request({
      method: 'POST',
      path: ANALYTICS_TOPICS_TEST.BETS_PATH,
      token,
      body: {
        walletId: wallet.id,
        eventId: event?.id,
        selection: ANALYTICS_TOPICS_TEST.SELECTION,
        stakeMinor: ANALYTICS_TOPICS_TEST.STAKE_MINOR,
        idempotencyKey: 'analytics-topics-bet'
      }
    });

    expect(bet.status).toBe(ANALYTICS_TOPICS_TEST.CREATED);
    expect(await produced(ANALYTICS_TOPICS_TEST.WALLET_DEBITED)).toBe(before + 1);
  });

  it('routes every analytics topic to Kafka, which is where the consumers listen', async () => {
    const topics = [
      ANALYTICS_TOPICS_TEST.PAYMENT_COMPLETED,
      ANALYTICS_TOPICS_TEST.PAYMENT_FAILED,
      ANALYTICS_TOPICS_TEST.WALLET_CREDITED,
      ANALYTICS_TOPICS_TEST.WALLET_DEBITED
    ];

    for (const topic of topics) {
      expect(await produced(topic)).toBeGreaterThan(0);

      const [row] = await DbHelper.query<{ count: number }>({ sql: ANALYTICS_TOPICS_TEST.KAFKA_SQL, params: [topic] });

      expect(row?.count ?? 0).toBe(0);
    }
  });
});
